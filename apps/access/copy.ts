import type {Locale} from './model.ts';
const ru: Record<string,string> = {
  'Language':'Язык', 'Switch to light theme':'Включить светлую тему', 'Switch to dark theme':'Включить тёмную тему',
  'Welcome back':'С возвращением', 'Sign in to Mercury':'Войти в Mercury', 'Your work, ready when you are.':'Всё готово к вашей работе.',
  'Email':'Электронная почта', 'Password':'Пароль', 'Show password':'Показать пароль', 'Sign in':'Войти', 'Signing in…':'Входим…',
  'Forgot password?':'Забыли пароль?', 'Enter your email address.':'Укажите электронную почту.',
  'Use a valid email address.':'Укажите корректный адрес электронной почты.', 'Enter your password.':'Введите пароль.',
  'Check the highlighted fields.':'Проверьте отмеченные поля.',
  'Email or password is incorrect.':'Неверная почта или пароль.',
  'We could not connect. Please try again.':'Не удалось подключиться. Попробуйте ещё раз.',
  'Sign-in service is not connected yet.':'Сервис входа пока не подключён.',
  'Password recovery is not connected yet.':'Восстановление пароля пока не подключено.',
  'Reset your password':'Восстановить пароль', 'Enter your email to request a reset link.':'Укажите почту, чтобы запросить ссылку для восстановления.',
  'Send reset link':'Отправить ссылку', 'Sending…':'Отправляем…', 'Back to sign in':'Вернуться ко входу',
  'Check your email':'Проверьте почту',
  'If an account exists for this address, you will receive a reset link.':'Если учётная запись с такой почтой существует, вы получите ссылку для восстановления.',
  'You are signed in':'Вход выполнен', 'Your session is ready.':'Можно продолжить работу.',
  'Continue':'Продолжить', 'Built by Jonnify':'Создано Jonnify', 'Skip to sign in':'Перейти к форме входа',
};
export function t(locale: Locale, text: string): string { return locale === 'ru' ? (ru[text] ?? text) : text; }
