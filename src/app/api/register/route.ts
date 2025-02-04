import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Ruta al archivo JSON
const filePath = path.join(process.cwd(), 'public/gyms.json');

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Leer el JSON actual
    const data = fs.readFileSync(filePath, 'utf8');
    const gyms = JSON.parse(data).gyms;

    // Crear un nuevo gimnasio con un ID único
    const newGym = {
      id: `gym_${Date.now()}`,
      name,
      email,
      password, // ⚠️ Esto es solo para pruebas, en producción se debe hashear
      manifests: [],
    };

    // Guardar el nuevo gimnasio en el JSON
    gyms.push(newGym);
    fs.writeFileSync(filePath, JSON.stringify({ gyms }, null, 2), 'utf8');

    return NextResponse.json({ success: true, gym: newGym }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error saving data', error },
      { status: 500 }
    );
  }
}
