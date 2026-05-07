// src/app/app.component.ts 
import { Component, signal,inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from "@angular/common"
import { Web3Service } from './services/web3'; 
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  public web3 = inject(Web3Service);
  protected readonly title = signal('angular-hardhat-starter-dapp');
}


