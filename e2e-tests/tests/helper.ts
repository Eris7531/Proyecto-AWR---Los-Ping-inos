/* Revisar si está correcto, este es el helper del Lab 8 para el Log In. 
Creo que debería funcionar, pero se debe adaptar en caso de que haya algún error. */

import type { Page } from "@playwright/test";

const backendUrl = 'http://localhost:3001';

const LogIn = async (page: Page, username: string, password: string) => {
  await page.goto('/login');
  await page.getByTestId('usernameLogin').fill(username);
  await page.getByTestId('passwordLogin').fill(password);
  await page.locator("form").getByRole( 'button', { name: /^Iniciar sesión/ }).click();
};

const Register = async (page: Page, username: string, password: string, confirmPassword: string) => {
  await page.goto('/register');
  await page.getByTestId('usernameReg').fill(username);
  await page.getByTestId('passwordReg').fill(password);
  await page.getByTestId('confirmPasswordReg').fill(confirmPassword);
  await page.locator("form").getByRole('button', { name: /^Crear mi cuenta/ }).click();
}

const ResetDB = async (page: Page) => {
  const response = await page.request.post(
      `${backendUrl}/api/testing/reset`,
    );
  if (!response.ok()) {
    throw new Error(`No se pudo reiniciar la DB: ${response.status()} ${response.statusText()}`);
  }
};

export { LogIn, ResetDB, Register };