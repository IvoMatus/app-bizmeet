# Generar un APK con Expo (EAS Build)

El proyecto ya tiene `eas.json` configurado con un perfil `preview` que genera un **APK** instalable (los demás perfiles generan AAB/bundle, pensados para la Play Store o para desarrollo con dev client).

```json
"preview": {
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```

## 1. Login en Expo (una sola vez por máquina)

```bash
npx eas-cli@latest login
```

Usa la cuenta `ivomatus` (owner configurado en `app.json`).

## 2. Lanzar el build en la nube

```bash
npx eas-cli@latest build --platform android --profile preview
```

- Corre en los servidores de EAS, no necesita Android Studio ni SDK local.
- Al terminar, imprime una URL de descarga del `.apk` y queda listado en https://expo.dev (proyecto `app-bizmeet`).
- `projectId` ya está seteado en `app.json` → `extra.eas.projectId`, no hace falta `eas init`.

## 3. Instalar el APK

Descargá el `.apk` desde el link que da la CLI (o desde expo.dev) y pasalo al dispositivo/emulador:

```bash
adb install ruta/al/archivo.apk
```

## Alternativa: build local (sin EAS)

Requiere Android Studio/SDK instalado y genera un APK de **debug**, no firmado para producción:

```bash
npx expo run:android
```

El APK queda en `android/app/build/outputs/apk/debug/`.

> ⚠️ No edites la carpeta `android/` a mano — ver regla de CNG (Continuous Native Generation) en `AGENTS.md`. La configuración nativa va en `app.json` / config plugins.

## Otros perfiles de `eas.json`

| Perfil | Uso | Output |
|---|---|---|
| `development` | Dev client para probar localmente con hot reload | APK con dev client |
| `preview` | Compartir con QA/stakeholders, instalación directa | APK |
| `production` | Subir a Play Store | AAB |

## Build automático al hacer push a GitHub (EAS Workflows)

El repo (`IvoMatus/app-bizmeet`) se puede conectar a Expo para que cada push dispare el build solo, sin tocar GitHub Actions ni manejar secrets. La función vieja ("Build Triggers") está deprecada; lo recomendado hoy es **EAS Workflows**.

### 1. Conectar GitHub (una sola vez, en el dashboard)

1. Entrá a https://expo.dev → proyecto `app-bizmeet` → **GitHub** (settings del proyecto).
2. Instalá la GitHub App de Expo y vinculá el repo `IvoMatus/app-bizmeet` (necesitás rol Owner/Admin en GitHub).
3. Requisito previo: tiene que existir al menos un build hecho desde tu máquina con `eas build` (ya lo vas a tener después del paso 2 de arriba).

### 2. Agregar el workflow al repo

Creá `.eas/workflows/build-preview.yml`:

```yaml
name: Build preview APK
on:
  push:
    branches:
      - main
jobs:
  build_android_preview:
    type: build
    params:
      platform: android
      profile: preview
```

Con esto, cada push a `main` dispara en la infra de Expo un build con el perfil `preview` (el que genera APK). Cambiá la rama si preferís disparar desde `dev`.

### 3. Build on-demand desde una PR (sin esperar al push)

Alternativa rápida, sin workflow: agregá la etiqueta `eas-build-android:preview` a cualquier Pull Request y Expo compila el último commit de esa rama.

### GitHub Actions "clásico" (si prefieren mantenerlo fuera de Expo)

También es posible disparar `eas build` desde un workflow de GitHub Actions normal, guardando un token (`eas whoami --json` → Access Tokens en expo.dev) como secret `EXPO_TOKEN` y corriendo `npx eas-cli build --platform android --profile preview --non-interactive`. Es más código de mantener que EAS Workflows, así que solo tiene sentido si ya tienen pipelines de GitHub Actions para el resto del repo y quieren todo en un solo lugar.

## Diferenciar builds de Android y iOS en el mismo workflow

Cada job del workflow es independiente — alcanza con darle un `platform` distinto a cada uno. Por defecto corren en paralelo.

```yaml
# .eas/workflows/build-preview.yml
name: Build preview
on:
  push:
    branches:
      - main

jobs:
  build_android_preview:
    type: build
    params:
      platform: android
      profile: preview

  build_ios_preview:
    type: build
    params:
      platform: ios
      profile: preview
```

Variantes si hace falta más control:

- **Secuencial** (uno después del otro): agregar `needs: [build_android_preview]` al job de iOS.
- **Condicional por rama** (ej. Android en cada push, iOS solo en `main`): `if: ${{ github.ref_name == 'main' }}` en el job.
- **Perfiles distintos por plataforma**: cada job puede apuntar a su propio `profile` de `eas.json` (no tienen que coincidir, ej. `android: preview` / `ios: production`).
