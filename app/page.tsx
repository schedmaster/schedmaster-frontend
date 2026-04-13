import { redirect } from "next/navigation";

export default function Home() {
  redirect("/seleccion-servicio");
  return null;
}
