import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid} from 'uuid';
import { last } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit {
  isDragOver = false;
  file: File | null = null;
  formVisible: boolean = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! your clip is being uploaded'
  inSubmission = false;
  percentValue = 0;
  showPercentValue = false;
  user : firebase.User | null = null

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(private storage: AngularFireStorage, private auth: AngularFireAuth) {
    auth.user.subscribe(user => {
      this.user = user
    })
    console.log(this.user);          
  }

  ngOnInit(): void {}

  storeFile($event: Event) {
    this.isDragOver = false;
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null;

    if(!this.file || this.file.type !== 'video/mp4'){
      return
    }

    this.title.setValue(this.file?.name.replace(/\.[^/.]+$/, ''));
    this.formVisible = true;
  }

  uploadFile() {

    this.showAlert = true;
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Your clip is being uploaded.'
    this.inSubmission = true;
    this.showPercentValue = true

    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`;

    const task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath)

    task.percentageChanges().subscribe(progress => {
      this.percentValue = (progress as number) / 100;
    })

    task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      next: (url) => {
        const clip = {
          uid: this.user?.uid,
          displayName : this.user?.email,
          title : this.title.value,
          fileName : `${clipFileName}mp4`,
          url
        }
        console.log(clip);
        
        this.alertColor = 'green',
        this.alertMsg = "Success! Your Clips uploaded successfully!",
        this.showPercentValue = false
      },
      error: (error) => {
        this.alertColor = 'red',
        this.alertMsg = 'Upload Failed! Please try again',
        this.inSubmission = true;
        this.showPercentValue = false;
        console.error(error);
        
      }
    })
  }
}
