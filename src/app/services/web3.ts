import { Injectable, signal } from '@angular/core'; 
import { ethers } from 'ethers'; 

@Injectable({ 
  providedIn: 'root' 
}) 

export class Web3Service { 
  // Usar Signals de Angular para llevar el seguimiento de la cuenta del usuario 
  public account = signal<string | null>(null); 
  public balance = signal<string | null>(null);
  public balanceToken = signal<string | null>(null); 

  public accounts: string[] = [""];
  public _account: string = "";
  private provider: any;
  private signer: any;
  private contract: any;

  // contrato: ERC20 - ITV
  private contractAddress: string = "0x0084AFF1029AbE14cDaf25De8da8b989ded1fc7b";
  //private abiString:       string[] = ['function balanceOf(string _owner) public view returns (uint256 balance)']; 
  private abiString = [
                        "function balanceOf(address) view returns (uint256)"
                      ]; 
  private uriProvider:     string = "https://sepolia.infura.io/v3/2IF8TbNFVS3gBJacR2ukyNrEPCi";

  async connectWallet() { 
    if (window.ethereum) { 
      try { 
        // Crear un proveedor Ethers del proveedor Ethereum  
        // del browser (ej., MetaMask) 
        this.provider = new ethers.BrowserProvider(window.ethereum); 
        // Requerir el acceso a las cuentas 
        const _accounts = await this.provider.send("eth_requestAccounts", []); 
        
        this.accounts = _accounts;
        this.account.set(_accounts[0]);
        this._account = _accounts[0];

        // Obtener el saldo de account
        this.getBalance();

        const provider = new ethers.JsonRpcProvider(this.uriProvider);
        
        // La conexion con el contrato se puede hacer en otro
        //this.connectToContract(this.contractAddress,this.abiString,this.provider);

        this.getBalanceOfToken(this.contractAddress,this._account,this.abiString,provider);
        this.increment();
      } catch (error) { 
        console.error("El usuario rechazó la conexión", error); 
      } 
    } else { 
      alert("Por favor instalar MetaMask!"); 
    } 
  }
  
  async connectToContract(_address: string, _abi: string[], _provider:any) {
    // Se requiere un firmante para operaciones de escritura (transacciones)
    this.signer = await this.provider.getSigner();

    // Crea la instancia del contrato
    this.contract = new ethers.Contract(_address, _abi, _provider);
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

  async getBalance() {
    const balanceWei = await this.provider.getBalance(this.accounts[0]);
    // conversion a una cadena legible en denominación Ether
    const balanceEth = ethers.formatEther(balanceWei);
    const balance = `Balance: ${balanceEth} ETH`;
    this.balance.set(balance);
    return
  }

  async getBalanceOfToken(_tokenAddress: string,_userAddress:string,_abi:string[],_provider:any){
    const abi = [ "function transfer(address, uint256) public returns (bool)",
                  "function transferFrom(address, address, uint256) public returns (bool)",
                  "function balanceOf(address) view returns (uint256)",
                  "function approve(address, uint256) public returns (bool)",
                  "function allowance(address, address) public view returns (uint256)"
                ];

    const contract = new ethers.Contract(_tokenAddress, _abi, _provider);
    //const tokenBalance = await contract[`balanceOf("${_userAddress}")`];
    const balanceITV = await contract['balanceOf']("0xf65112fa0998477c990fb71722b067b7892f2160");
    const tokenBalance = `Balance: ${balanceITV} ITV`;
    this.balanceToken.set(tokenBalance);
    
    return;
  }

  async increment(){
    const abi = ["function increment() public",
                 "function getCount() public view returns (uint256)",
                 "event ValueChanged(uint oldValue, uint256 newValue)"
                ];
    
    const provider = new ethers.JsonRpcProvider(this.uriProvider);
    const contractAddress = "0xBb69FE8095457e7E59e051E5630453E374AF5933";
    const contract = new ethers.Contract(contractAddress, abi, provider);
    //const tx = await contract.connect(this.signer)["increment"];

  }

} 