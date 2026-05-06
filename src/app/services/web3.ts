import { Injectable, signal } from '@angular/core'; 
import { ethers } from 'ethers'; 

@Injectable({ 
  providedIn: 'root' 
}) 

export class Web3Service { 
  // Usar Signals de Angular para llevar el seguimiento de la cuenta del usuario 
  public account = signal<string | null>(null); 
  private provider: any;
  private signer: any;
  private contract: any;
  private direccionContrato: string = "";
  private abiString: string[] = [""]; 

  async connectWallet() { 
    if (window.ethereum) { 
      try { 
        // Crear un proveedor Ethers del proveedor Ethereum  
        // del browser (ej., MetaMask) 
        this.provider = new ethers.BrowserProvider(window.ethereum); 
        // Requerir el acceso a las cuentas 
        const accounts = await this.provider.send("eth_requestAccounts", []); 
        this.account.set(accounts[0]); 
        this.direccionContrato = "";
        // La conexion con el contrato se puede hacer en otro
        this.connectToContract(this.direccionContrato,this.abiString);

      } catch (error) { 
        console.error("El usuario rechazó la conexión", error); 
      } 
    } else { 
      alert("Por favor instalar MetaMask!"); 
    } 
  }
  
  async connectToContract(address: string, abi: any[]) {
    // Se requiere un firmante para operaciones de escritura (transacciones)
    this.signer = await this.provider.getSigner();
    
    // Crea la instancia del contrato
    this.contract = new ethers.Contract(address, abi, this.signer);
    return this.contract;
  }

  // Ejemplo: Lectura de datos
  async getDato(): Promise<string> {
    return await this.contract.getDato(); // Asume que existe la funcion getDato
  }

  // Ejemplo: Escribiendo dato (require una transaccion)
  async setDato(newDato: string) {
    const tx = await this.contract.setDato(newDato);
    await tx.wait(); // Esperar a que la transaccion se complete
  }
} 