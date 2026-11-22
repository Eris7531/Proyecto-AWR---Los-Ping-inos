import { test, expect } from '@playwright/test';
import { LogIn, Register, ResetDB } from './helper';

test.describe('Flujo de Login y acceso protegido', () => {
  test.beforeEach(async ({ page }) => {
    await ResetDB(page);
  });

  test('1. Bloqueo de acceso protegido sin sesión: redirige al login', async ({ page }) => {
    // Intentar navegar directamente a una ruta protegida sin haber iniciado sesión
    await page.goto('/games/12345');

    // Debe redirigir al formulario de login
    await expect(page).toHaveURL(/.*\/login/);

    // Verificar que los campos del login están visibles
    await expect(page.getByTestId('usernameLogin')).toBeVisible();
    await expect(page.getByTestId('passwordLogin')).toBeVisible();
    await expect(page.locator('form').getByRole('button', { name: /^Iniciar sesión/ })).toBeVisible();

    // Comprobar que no se visualiza el contenido protegido de la ruta
    await expect(page.getByRole('heading', { name: 'Salas disponibles' })).not.toBeVisible();
  });

  test('2. Login fallido: credenciales incorrectas muestran error y no otorgan acceso', async ({ page }) => {
    // Intentar iniciar sesión con credenciales inexistentes
    await LogIn(page, 'usuario_inexistente', 'clave_incorrecta');

    // Verificar que se muestra un mensaje de error
    const errorAlert = page.locator('.error');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/invalid username or password/i);

    // Verificar que no se otorgó acceso y permanece en /login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByTestId('usernameLogin')).toBeVisible();
  });

  test('3. Login exitoso + acceso a ruta protegida', async ({ page }) => {
    const testUser = {
      username: 'usuarioTest',
      password: 'password123',
    };

    // 1. Registrar usuario de prueba usando el helper Register
    await Register(page, testUser.username, testUser.password, testUser.password);
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('status')).toContainText('¡Cuenta creada! Ya puedes iniciar sesión.');

    // 2. Iniciar sesión con las credenciales registradas usando el helper LogIn
    await LogIn(page, testUser.username, testUser.password);

    // 3. Verificar que la sesión se inicia correctamente (redirige al home y muestra usuario autenticado)
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Selecciona un juego')).toBeVisible();

    // El botón de cuenta de usuario en el banner está visible
    const accountButton = page.getByRole('button', { name: 'cuenta del usuario' });
    await expect(accountButton).toBeVisible();

    // Al abrir el menú de usuario debe mostrar la opción de Cerrar sesión
    await accountButton.click();
    await expect(page.getByRole('menuitem', { name: 'Cerrar sesión' })).toBeVisible();
    await page.keyboard.press('Escape');

    // 4. Navegar a una ruta protegida (haciendo click en un juego disponible)
    await page.getByText('Counter-Strike 2').click();

    // Comprobar que accede a la ruta protegida y visualiza su contenido
    await expect(page).toHaveURL(/\/games\/.+/);
    await expect(page.getByRole('heading', { name: 'Counter-Strike 2' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Salas disponibles' })).toBeVisible();
    await expect(page.getByLabel('Volver a los juegos')).toBeVisible();
  });
});
