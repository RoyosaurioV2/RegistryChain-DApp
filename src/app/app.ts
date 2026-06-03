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
  equiposSesion: any[] = [];

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
  this.equipo = null;
  this.mensaje = '';

  if (!this.numeroSerieConsulta.trim()) {
    this.mensaje = 'Ingresa un número de serie para consultar.';
    return;
  }

  try {
    this.cargando = true;
    this.mensaje = 'Consultando equipo...';

    const resultado = await this.web3.consultarEquipo(
      this.numeroSerieConsulta.trim()
    );

    this.equipo = resultado;
    this.mensaje = 'Consulta realizada correctamente.';

    const existe = this.equiposSesion.some(
      e => e.numeroSerie === resultado.numeroSerie
    );

    if (!existe) {
      this.equiposSesion.push(resultado);
    } else {
      this.equiposSesion = this.equiposSesion.map(e =>
        e.numeroSerie === resultado.numeroSerie ? resultado : e
      );
    }

  } catch (error) {
    console.error(error);
    this.equipo = null;
    this.mensaje = 'Equipo no encontrado o error al consultar.';
  } finally {
    this.cargando = false;
  }
}

async actualizarEstado() {
  if (!this.numeroSerieEstado.trim()) {
    this.mensaje = 'Ingresa el número de serie para actualizar.';
    return;
  }

  try {
    this.cargando = true;
    this.mensaje = 'Actualizando estado en blockchain...';

    this.ultimoHash = await this.web3.actualizarEstado(
      this.numeroSerieEstado.trim(),
      Number(this.nuevoEstado)
    );

    this.mensaje = 'Estado actualizado correctamente. Consulta nuevamente el equipo.';

    // Limpia resultado anterior para evitar mostrar datos viejos
    this.equipo = null;
    this.numeroSerieConsulta = this.numeroSerieEstado.trim();

  } catch (error) {
    console.error(error);
    this.mensaje = 'Error al actualizar estado.';
  } finally {
    this.cargando = false;
  }
}
}

