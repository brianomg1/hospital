document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const notificacionEl = document.getElementById('notificacion');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    firstDay: 1,
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    eventClick: function (info) {
      const confirmar = confirm(`¿Eliminar el turno de ${info.event.title}?`);
      if (confirmar) {
        info.event.remove();
        mostrarNotificacion(`🗑️ Turno eliminado: ${info.event.title}`);
      }
    }
  });

  calendar.render();

  let ultimoEventoId = null;

  document.getElementById('form-turno').addEventListener('submit', function (e) {
    e.preventDefault();

    const empleado = document.getElementById('empleado').value;
    const area = document.getElementById('area').value;
    const fecha = document.getElementById('fecha').value;
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;
    const tipoTurno = document.getElementById('tipoTurno').value;

    if (!empleado || !area || !fecha || !horaInicio || !horaFin || !tipoTurno) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    const hoy = new Date();
    const fechaSeleccionada = new Date(fecha);
    const limite = new Date();
    limite.setDate(hoy.getDate() + 14);

    if (fechaSeleccionada < hoy || fechaSeleccionada > limite) {
      alert("La fecha debe estar dentro de los próximos 14 días.");
      return;
    }

    const nuevaInicio = new Date(`${fecha}T${horaInicio}`);
    const nuevaFin = new Date(`${fecha}T${horaFin}`);

    // Validar conflicto en cualquier persona
    const eventosExistentes = calendar.getEvents();
    const conflicto = eventosExistentes.some(event => {
      const inicioExistente = new Date(event.start);
      const finExistente = new Date(event.end);

      const seSolapan = nuevaInicio < finExistente && nuevaFin > inicioExistente;
      return seSolapan;
    });

    if (conflicto) {
      alert("⚠️ Ese horario ya está ocupado por otra persona.");
      return;
    }

    let claseTurno = '';
    if (tipoTurno === 'mañana') claseTurno = 'turno-manana';
    if (tipoTurno === 'tarde') claseTurno = 'turno-tarde';
    if (tipoTurno === 'noche') claseTurno = 'turno-noche';

    const evento = {
      id: String(Date.now()),
      title: `${empleado} - ${area}`,
      start: `${fecha}T${horaInicio}`,
      end: `${fecha}T${horaFin}`,
      classNames: [claseTurno]
    };

    calendar.addEvent(evento);
    ultimoEventoId = evento.id;

    mostrarNotificacion(`✅ Turno asignado: ${empleado}, ${area} el ${fecha} de ${horaInicio} a ${horaFin}`);
    e.target.reset();
  });

  function mostrarNotificacion(mensaje) {
    notificacionEl.innerHTML = mensaje;
    notificacionEl.classList.remove('d-none');
  }

  document.getElementById('btn-deshacer')?.addEventListener('click', function () {
    if (ultimoEventoId) {
      const evento = calendar.getEventById(ultimoEventoId);
      if (evento) evento.remove();
      ultimoEventoId = null;
    }
    notificacionEl.classList.add('d-none');
  });
});
