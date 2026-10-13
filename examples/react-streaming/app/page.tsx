import Link from 'next/link';
export default function Home() { return <main><h1>Laboratorio de streaming</h1><Link href="/envios">Ver envíos</Link><br/><Link href="/envios?empty=1">Probar estado vacío</Link></main>; }
