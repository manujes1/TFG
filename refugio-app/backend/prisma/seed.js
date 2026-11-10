// Datos de ejemplo para probar la aplicación: usuarios de los tres roles, animales,
// expedientes, adopciones, apadrinamientos y donaciones.
// Ejecutar con: npm run db:seed
// Borra todos los datos existentes antes de insertar los nuevos.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Limpieza
  console.log('Borrando datos existentes...');
  await prisma.donacion.deleteMany();
  await prisma.apadrinamiento.deleteMany();
  await prisma.adopcion.deleteMany();
  await prisma.expedienteMedico.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.user.deleteMany();

  // Usuarios
  console.log('Creando usuarios...');
  const passwordHashAdmin = await bcrypt.hash('admin12345', 10);
  const passwordHashUser = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@refugio.com',
      passwordHash: passwordHashAdmin,
      nombre: 'Admin',
      apellidos: 'Refugio',
      rol: 'ADMIN'
    }
  });

  const voluntario = await prisma.user.create({
    data: {
      email: 'voluntario@refugio.com',
      passwordHash: passwordHashAdmin,
      nombre: 'Carmen',
      apellidos: 'Ruiz',
      telefono: '600123456',
      rol: 'VOLUNTARIO'
    }
  });

  const maria = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      passwordHash: passwordHashUser,
      nombre: 'María',
      apellidos: 'García López',
      telefono: '600111222',
      rol: 'ADOPTANTE',
      preferencias: {
        tipoVivienda: 'piso',
        metrosCuadrados: 80,
        jardin: false,
        ninos: true,
        otrosPerros: false,
        otrosGatos: false,
        experiencia: 'media',
        tiempoDiario: 'medio',
        preferenciaEspecie: 'PERRO'
      }
    }
  });

  const juan = await prisma.user.create({
    data: {
      email: 'juan@example.com',
      passwordHash: passwordHashUser,
      nombre: 'Juan',
      apellidos: 'Martínez',
      telefono: '600333444',
      rol: 'ADOPTANTE',
      preferencias: {
        tipoVivienda: 'casa',
        metrosCuadrados: 150,
        jardin: true,
        ninos: false,
        otrosPerros: true,
        otrosGatos: false,
        experiencia: 'alta',
        tiempoDiario: 'mucho',
        preferenciaEspecie: 'PERRO'
      }
    }
  });

  const test = await prisma.user.create({
    data: {
      email: 'test@refugio.com',
      passwordHash: passwordHashUser,
      nombre: 'Test',
      apellidos: 'Usuario',
      rol: 'ADOPTANTE'
    }
  });

  // Animales
  console.log('Creando animales...');

  const luna = await prisma.animal.create({
    data: {
      nombre: 'Luna',
      especie: 'PERRO',
      raza: 'Mestizo labrador',
      sexo: 'HEMBRA',
      edadEstimada: 3,
      peso: 22.5,
      color: 'Marrón y blanco',
      estado: 'DISPONIBLE',
      descripcionManual: 'Luna es cariñosa, juguetona y perfecta para familias con niños. Adora los paseos largos y aprender trucos nuevos.',
      ubicacion: 'Zona A - Jaula 3',
      caracteristicas: {
        energia: 'alta',
        temperamento: 'sociable',
        aptoNinos: true,
        aptoOtrosPerros: true,
        aptoGatos: false
      }
    }
  });

  const rocco = await prisma.animal.create({
    data: {
      nombre: 'Rocco',
      especie: 'PERRO',
      raza: 'Pastor alemán',
      sexo: 'MACHO',
      edadEstimada: 5,
      peso: 34.0,
      color: 'Negro y fuego',
      estado: 'DISPONIBLE',
      descripcionManual: 'Rocco es un perro tranquilo y muy fiel. Necesita una familia con experiencia en razas grandes.',
      ubicacion: 'Zona A - Jaula 7',
      caracteristicas: {
        energia: 'media',
        temperamento: 'calmado',
        aptoNinos: false,
        aptoOtrosPerros: true,
        aptoGatos: false
      }
    }
  });

  const nala = await prisma.animal.create({
    data: {
      nombre: 'Nala',
      especie: 'GATO',
      raza: 'Común europeo',
      sexo: 'HEMBRA',
      edadEstimada: 2,
      peso: 3.8,
      color: 'Atigrada',
      estado: 'DISPONIBLE',
      descripcionManual: 'Nala es curiosa e independiente. Ideal para pisos, prefiere una casa sin otros animales.',
      ubicacion: 'Zona B - Gatera 2',
      caracteristicas: {
        energia: 'media',
        temperamento: 'independiente',
        aptoNinos: true,
        aptoOtrosPerros: false,
        aptoGatos: false
      }
    }
  });

  const michi = await prisma.animal.create({
    data: {
      nombre: 'Michi',
      especie: 'GATO',
      raza: 'Común europeo',
      sexo: 'MACHO',
      edadEstimada: 7,
      peso: 4.5,
      color: 'Negro',
      estado: 'EN_TRATAMIENTO',
      descripcionManual: 'Michi está en tratamiento de una infección respiratoria. En cuanto se recupere estará disponible para adopción.',
      ubicacion: 'Zona B - Gatera 5',
      caracteristicas: {
        energia: 'baja',
        temperamento: 'tranquilo',
        aptoNinos: true,
        aptoOtrosPerros: false,
        aptoGatos: true
      }
    }
  });

  const buddy = await prisma.animal.create({
    data: {
      nombre: 'Buddy',
      especie: 'PERRO',
      raza: 'Beagle',
      sexo: 'MACHO',
      edadEstimada: 4,
      peso: 15.0,
      color: 'Tricolor',
      estado: 'ADOPTADO',
      descripcionManual: 'Buddy encontró familia el mes pasado.',
      ubicacion: '—',
      caracteristicas: {
        energia: 'alta',
        temperamento: 'juguetón',
        aptoNinos: true,
        aptoOtrosPerros: true,
        aptoGatos: false
      }
    }
  });

  const kira = await prisma.animal.create({
    data: {
      nombre: 'Kira',
      especie: 'PERRO',
      raza: 'Podenco',
      sexo: 'HEMBRA',
      edadEstimada: 6,
      peso: 12.0,
      color: 'Canela',
      estado: 'EN_ACOGIDA',
      descripcionManual: 'Kira está actualmente en acogida temporal mientras se recupera de la timidez inicial.',
      ubicacion: 'Acogida temporal',
      caracteristicas: {
        energia: 'media',
        temperamento: 'tímido',
        aptoNinos: false,
        aptoOtrosPerros: true,
        aptoGatos: false
      }
    }
  });

  // Expedientes médicos
  console.log('Creando expedientes médicos...');

  await prisma.expedienteMedico.createMany({
    data: [
      {
        animalId: luna.id,
        tipo: 'REVISION',
        descripcion: 'Revisión inicial al ingreso. Estado general bueno.',
        veterinario: 'Dra. López',
        fecha: new Date('2026-03-04')
      },
      {
        animalId: luna.id,
        tipo: 'VACUNA',
        descripcion: 'Vacuna polivalente anual.',
        veterinario: 'Dr. Martínez',
        fecha: new Date('2026-03-10'),
        proximaRevision: new Date('2027-03-10')
      },
      {
        animalId: luna.id,
        tipo: 'CIRUGIA',
        descripcion: 'Esterilización sin complicaciones.',
        veterinario: 'Dr. García',
        fecha: new Date('2026-03-25')
      },
      {
        animalId: michi.id,
        tipo: 'TRATAMIENTO',
        descripcion: 'Antibiótico de amplio espectro para infección respiratoria. Duración estimada 10 días.',
        veterinario: 'Dra. López',
        fecha: new Date('2026-07-20'),
        proximaRevision: new Date('2026-08-05')
      },
      {
        animalId: rocco.id,
        tipo: 'VACUNA',
        descripcion: 'Refuerzo antirrábico.',
        veterinario: 'Dr. Martínez',
        fecha: new Date('2026-06-15'),
        proximaRevision: new Date('2027-06-15')
      },
      {
        animalId: nala.id,
        tipo: 'DESPARASITACION',
        descripcion: 'Desparasitación interna y externa.',
        veterinario: 'Dra. López',
        fecha: new Date('2026-07-01')
      }
    ]
  });

  // Adopciones
  console.log('Creando adopciones...');

  // La de Buddy: completada (por eso el animal está ADOPTADO)
  await prisma.adopcion.create({
    data: {
      animalId: buddy.id,
      usuarioId: juan.id,
      estado: 'COMPLETADA',
      notas: 'Juan tiene casa con jardín y experiencia previa. Adopción exitosa.',
      fechaSolicitud: new Date('2026-06-01'),
      fechaAprobacion: new Date('2026-06-05'),
      fechaCompletada: new Date('2026-06-10')
    }
  });

  // Una en revisión: María quiere adoptar a Luna
  await prisma.adopcion.create({
    data: {
      animalId: luna.id,
      usuarioId: maria.id,
      estado: 'EN_REVISION',
      notas: 'María vive en piso, sin otros animales, tiene una niña de 8 años.',
      fechaSolicitud: new Date('2026-07-28')
    }
  });

  // Una solicitud reciente sin revisar
  await prisma.adopcion.create({
    data: {
      animalId: nala.id,
      usuarioId: test.id,
      estado: 'SOLICITADA',
      notas: 'Interesado en gato tranquilo.',
      fechaSolicitud: new Date('2026-08-02')
    }
  });

  // Una rechazada
  await prisma.adopcion.create({
    data: {
      animalId: rocco.id,
      usuarioId: test.id,
      estado: 'RECHAZADA',
      motivoRechazo: 'Rocco necesita una familia con experiencia en razas grandes; el solicitante no la tiene.',
      fechaSolicitud: new Date('2026-07-15')
    }
  });

  // Apadrinamientos
  console.log('Creando apadrinamientos...');

  await prisma.apadrinamiento.create({
    data: {
      animalId: michi.id,
      usuarioId: maria.id,
      tipo: 'MENSUAL',
      cantidad: 20,
      estado: 'ACTIVO',
      fechaInicio: new Date('2026-06-01')
    }
  });

  await prisma.apadrinamiento.create({
    data: {
      animalId: kira.id,
      usuarioId: juan.id,
      tipo: 'MENSUAL',
      cantidad: 15,
      estado: 'ACTIVO',
      fechaInicio: new Date('2026-05-10')
    }
  });

  await prisma.apadrinamiento.create({
    data: {
      animalId: rocco.id,
      usuarioId: test.id,
      tipo: 'PUNTUAL',
      cantidad: 50,
      estado: 'FINALIZADO',
      fechaInicio: new Date('2026-07-20'),
      fechaFin: new Date('2026-07-20')
    }
  });

  // Donaciones
  console.log('Creando donaciones...');

  await prisma.donacion.createMany({
    data: [
      {
        usuarioId: maria.id,
        cantidad: 30,
        concepto: 'Comida para gatos',
        metodoPago: 'transferencia',
        fecha: new Date('2026-07-05')
      },
      {
        usuarioId: juan.id,
        cantidad: 100,
        concepto: 'Colaboración mensual',
        metodoPago: 'transferencia',
        fecha: new Date('2026-07-15')
      },
      {
        usuarioId: null,
        cantidad: 50,
        concepto: 'Donación anónima en caja',
        metodoPago: 'efectivo',
        fecha: new Date('2026-07-22')
      },
      {
        usuarioId: test.id,
        cantidad: 25,
        concepto: 'Medicamentos',
        metodoPago: 'tarjeta',
        fecha: new Date('2026-08-01')
      }
    ]
  });

  console.log('\nSeed completado:');
  console.log(`   Usuarios:         ${await prisma.user.count()}`);
  console.log(`   Animales:         ${await prisma.animal.count()}`);
  console.log(`   Expedientes:      ${await prisma.expedienteMedico.count()}`);
  console.log(`   Adopciones:       ${await prisma.adopcion.count()}`);
  console.log(`   Apadrinamientos:  ${await prisma.apadrinamiento.count()}`);
  console.log(`   Donaciones:       ${await prisma.donacion.count()}`);
  console.log('\nCuentas de prueba:');
  console.log('   admin@refugio.com       / admin12345    (ADMIN)');
  console.log('   voluntario@refugio.com  / admin12345    (VOLUNTARIO)');
  console.log('   maria@example.com       / password123   (ADOPTANTE)');
  console.log('   juan@example.com        / password123   (ADOPTANTE)');
  console.log('   test@refugio.com        / password123   (ADOPTANTE)');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
