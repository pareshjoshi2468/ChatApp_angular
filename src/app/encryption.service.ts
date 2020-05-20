import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {

  constructor() {}

  SECRET_KEY="ameramerameramerameramerameramer"
  IV="0123456789abcdef"

  encryptUsingAES256(data) {
    // console.log("Data",data)
    let encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data), CryptoJS.enc.Utf8.parse(this.SECRET_KEY), {
        iv: CryptoJS.enc.Utf8.parse(this.IV),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });
    return encrypted.toString();
  }
  decryptUsingAES256(data) {
  
     let decrypted=  CryptoJS.AES.decrypt(
      data, CryptoJS.enc.Utf8.parse(this.SECRET_KEY), {
        iv: CryptoJS.enc.Utf8.parse(this.IV),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }).toString(CryptoJS.enc.Utf8);
      // console.log(decrypted)
      return JSON.parse(decrypted);
  }

}