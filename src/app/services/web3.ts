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
  public contador = signal<string | null>(null); 

  // contrato: ERC20 - ITV
  public contractAddressITV: string = "0x0084AFF1029AbE14cDaf25De8da8b989ded1fc7b";
  // contrato: Contador
  public contractAddressContador: string = "0xBb69FE8095457e7E59e051E5630453E374AF5933";

  public accounts: string[] = [""];
  public _account: string = "";
  private provider: any;
  private signer: any;
  private contract: any;
  private contractCounter: any;

  // uriProvider, que no requiere conectar con un Wallet, pero sirve para consultar, invocando funciones                     
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
        
        // La conexion con el contrato se puede hacer en otro
        // this.connectToContract(this.contractAddressITV,this.abiString,this.provider);

        this.getBalanceOfToken(this.contractAddressITV,this.accounts[0]);

        this.contador.set('Contador: 0');
        this.setupEventListener();

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

  async getBalanceOfToken(_tokenAddress: string,_userAddress:string){
    const _abi = [ "function transfer(address, uint256) public returns (bool)",
                  "function transferFrom(address, address, uint256) public returns (bool)",
                  "function balanceOf(address) view returns (uint256)",
                  "function approve(address, uint256) public returns (bool)",
                  "function allowance(address, address) public view returns (uint256)"
                ];

    const contract = new ethers.Contract(_tokenAddress, _abi, this.provider);
    const balanceITV = await contract['balanceOf'](this.accounts[0]);
    const tokenBalance = `Balance: ${balanceITV} ITV`;
    
    console.log(tokenBalance);
    
    this.balanceToken.set(tokenBalance);
    
    return;
  }

  public async increment(){
    // Ejemplo de invocación a funcion que genera transacción.
    const _abi = ["function increment() public",
                 "function getCount() public view returns (uint256)",
                 "event ValueChanged(uint oldValue, uint256 newValue)"
                ];

    const _signer = await this.provider.getSigner();

    var contract : ethers.Contract = new ethers.Contract(this.contractAddressContador, _abi, _signer);
    var tx:ethers.Transaction = await contract?.["increment"]();
    
    console.log(tx.hash);

  }

  public async setupEventListener(){
    const _abi = ["function increment() public",
              "function getCount() public view returns (uint256)",
              "event ValueChanged(uint oldValue, uint256 newValue)"
            ];

    const _signer = await this.provider.getSigner();
    this.contractCounter = new ethers.Contract(this.contractAddressContador, _abi, _signer);

    var ant: number = 0;
    var nvo: number = 0;

    // Begin listening for any ValueChanged event
    this.contractCounter.on("ValueChanged", (ant:number,nvo:number,event:any) => {
     
      // console.log(`${event} => ${ ant } => ${ nvo }`);

      // The `event.log` has the entire EventLog
      this.contador.set(`Contador: ${nvo}`);
      // Optionally, stop listening
      // event.removeListener();

    });
  }

} 