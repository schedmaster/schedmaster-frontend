# Logo de SchedMaster

Versiones SVG trazadas a partir de `LOGO SCHEDMASTER.png` (1536 × 1024 px).

| Versión | Archivo en el frontend | URL pública | Proporción |
| --- | --- | --- | --- |
| Símbolo con texto | `public/brand/schedmaster-logo.svg` | `/brand/schedmaster-logo.svg` | 760 × 575 |
| Solo símbolo | `public/brand/schedmaster-symbol.svg` | `/brand/schedmaster-symbol.svg` | 421 × 445 |
| Solo texto | `public/brand/schedmaster-wordmark.svg` | `/brand/schedmaster-wordmark.svg` | 760 × 107 |

Los archivos conservan la composición, las formas, la separación, los colores,
los degradados del original. Las letras están convertidas en curvas:
no requieren instalar una fuente ni dependen del navegador para su tipografía.

El fondo y los espacios entre trazos son transparentes. Se eliminó la capa gris
clara de la sombra trazada desde el PNG: no quedan superficies blancas ni grises
por detrás del símbolo. Se recortó el margen vacío del PNG y se dejó un pequeño
margen de seguridad alrededor del dibujo. En la versión completa se conserva
la distancia original entre el símbolo y el texto.

Los SVG contienen trazados y degradados vectoriales, sin imágenes rasterizadas
incrustadas, scripts ni recursos externos. Para conservar la proporción al
usarlos, definir solo el ancho y dejar la altura en `auto`.

La interfaz usa el componente compartido `app/components/BrandLogo.tsx`:

```tsx
<BrandLogo /> // Solo símbolo: variante principal de la interfaz.
<BrandLogo variant="horizontal" /> // Símbolo y texto, disponible para usos futuros.
<BrandLogo variant="full" /> // Composición completa del original.
<BrandLogo variant="symbol" />
<BrandLogo variant="wordmark" />
```

Se integra en las barras pública y de alumnos, el panel administrativo, la
portada, el pie de página, login, registro, verificación 2FA, selección de
servicio y estado de cuenta. Se usa el símbolo sin texto también en el pie de
página. `app/lib/brand.ts` comparte la misma URL versionada del símbolo
transparente con la interfaz, el favicon SVG y el manifiesto de la app. El componente no
añade fondos, bordes ni márgenes blancos. No se aplican filtros ni recoloraciones
al dibujo.

Los iconos de pestaña, Apple y PWA se exportan a partir del símbolo original:

```bash
npm run generate:brand-icons
```

El comando genera `app/favicon.ico` (16, 32 y 48 px), `app/apple-icon.png`
(180 px) y `public/brand/schedmaster-icon-{192,512}.png`. Los iconos de la PWA
también se usan en la pantalla sin conexión. Se exportan con fondo transparente,
sin recuadro blanco; el service worker renueva su caché para instalar la nueva
marca. El manifiesto declara los iconos transparentes como `any`.

## Referencia y verificación

- Archivo fuente: `LOGO SCHEDMASTER.png` proporcionado por el usuario.
- SHA-256 del PNG: `b8f8be77e92bb1ad0d503c56b6c54970ddc5fb790e0afbfb1694e1099c855359`.
- Trazado de contornos con curvas Bézier y muestreo de los degradados originales.
- Comparación visual del SVG renderizado con el PNG a su resolución original.
- Verificación de que las tres versiones se renderizan, conservan sus
  proporciones y no contienen texto editable ni referencias rasterizadas.

El PNG es la referencia del diseño. Como en cualquier trazado de una imagen
rasterizada, el suavizado de bordes puede variar ligeramente al renderizar SVG.
