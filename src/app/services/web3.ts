// src/app/services/web3.ts

import { Injectable, signal } from '@angular/core';
import { ethers } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  public account = signal<string | null>(null);

  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  private direccionContrato = '0xCda50A780C10d4a3659ce3f3b500Aa4E78977D1F';

  private abi = [
    'function registrarEquipo(string _numeroSerie,string _tipo,string _marca,string _modelo,string _propietario)',
    'function consultarEquipo(string _numeroSerie) view returns (string,string,string,string,string,uint8,uint256,address)',
    'function actualizarEstado(string _numeroSerie,uint8 _nuevoEstado)',
    'function existeEquipo(string _numeroSerie) view returns (bool)',
    'event EquipoRegistrado(string numeroSerie,string propietario,address registradoPor)',
    'event EstadoActualizado(string numeroSerie,uint8 nuevoEstado)'
  ];

  async connectWallet() {
    if (!window.ethereum) {
      alert('Por favor instala MetaMask');
      return;
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await this.provider.send('eth_requestAccounts', []);
    this.account.set(accounts[0]);

    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(
      this.direccionContrato,
      this.abi,
      this.signer
    );
  }

  async registrarEquipo(
    numeroSerie: string,
    tipo: string,
    marca: string,
    modelo: string,
    propietario: string
  ) {
    if (!this.contract) throw new Error('Contrato no conectado');

    const tx = await this.contract['registrarEquipo'](
      numeroSerie,
      tipo,
      marca,
      modelo,
      propietario
    );

    await tx.wait();
    return tx.hash;
  }

  async consultarEquipo(numeroSerie: string) {
    if (!this.contract) throw new Error('Contrato no conectado');

    const data = await this.contract['consultarEquipo'](numeroSerie);

    return {
      numeroSerie: data[0],
      tipo: data[1],
      marca: data[2],
      modelo: data[3],
      propietario: data[4],
      estado: this.estadoTexto(Number(data[5])),
      fechaRegistro: new Date(Number(data[6]) * 1000).toLocaleString(),
      registradoPor: data[7]
    };
  }

  async actualizarEstado(numeroSerie: string, nuevoEstado: number) {
    if (!this.contract) throw new Error('Contrato no conectado');

    const tx = await this.contract['actualizarEstado'](
      numeroSerie,
      nuevoEstado
    );

    await tx.wait();
    return tx.hash;
  }

  estadoTexto(estado: number): string {
    const estados = ['Activo', 'Extraviado', 'Robado', 'Recuperado'];
    return estados[estado] ?? 'Desconocido';
  }
}