// src/app/app.component.ts 
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Web3Service } from './services/web3';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public web3 = inject(Web3Service);

  numeroSerie = '';
  tipo = '';
  marca = '';
  modelo = '';
  propietario = '';

  numeroSerieConsulta = '';
  numeroSerieEstado = '';
  nuevoEstado = 0;

  equipo: any = null;
  ultimoHash = '';
  mensaje = '';
  cargando = false;

  async registrar() {
    try {
      this.cargando = true;
      this.mensaje = 'Registrando equipo en blockchain...';

      this.ultimoHash = await this.web3.registrarEquipo(
        this.numeroSerie,
        this.tipo,
        this.marca,
        this.modelo,
        this.propietario
      );

      this.mensaje = 'Equipo registrado correctamente.';
    } catch (error) {
      console.error(error);
      this.mensaje = 'Error al registrar el equipo.';
    } finally {
      this.cargando = false;
    }
  }

  async consultar() {
    try {
      this.cargando = true;
      this.mensaje = 'Consultando equipo...';

      this.equipo = await this.web3.consultarEquipo(this.numeroSerieConsulta);
      this.mensaje = 'Equipo encontrado.';
    } catch (error) {
      console.error(error);
      this.equipo = null;
      this.mensaje = 'Equipo no encontrado.';
    } finally {
      this.cargando = false;
    }
  }

  async actualizarEstado() {
    try {
      this.cargando = true;
      this.mensaje = 'Actualizando estado en blockchain...';

      this.ultimoHash = await this.web3.actualizarEstado(
        this.numeroSerieEstado,
        Number(this.nuevoEstado)
      );

      this.mensaje = 'Estado actualizado correctamente.';
    } catch (error) {
      console.error(error);
      this.mensaje = 'Error al actualizar estado.';
    } finally {
      this.cargando = false;
    }
  }
}

