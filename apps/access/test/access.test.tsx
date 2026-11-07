import {afterEach, expect, test} from 'vitest';
import {cleanup, fireEvent, render, typeInto, waitFor} from '@fiberfx/testing';
import App from '../App.tsx';
import {AuthError, type AuthService} from '../auth.ts';
import '@fiberfx/ui/styles.css';
import '../access.css';

afterEach(()=>{cleanup();history.replaceState(null,'',location.pathname);document.documentElement.className='light-theme';});
const input=(id:string)=>document.getElementById(id) as HTMLInputElement;
const fill=()=>{typeInto(input('access-email'),'person@example.com');typeInto(input('access-password'),'test-secret-only');};
const submit=()=>fireEvent.submit(document.querySelector('form')!);
const tick=()=>new Promise(resolve=>setTimeout(resolve,30));

test('primary screen is an empty sign-in form with no playground controls',()=>{
 const view=render(<App/>);
 expect(view.getByRole('heading',{name:'Sign in to Mercury'})).toBeTruthy();
 expect(input('access-email').value).toBe('');expect(input('access-password').value).toBe('');
 expect(view.queryByText('Simulated response')).toBeNull();expect(view.queryByText('Use sample data')).toBeNull();
 expect(input('access-password').autocomplete).toBe('current-password');
});
test('invalid input receives associated errors and focus before any service call',async()=>{
 let calls=0;const service:AuthService={async signIn(){calls++},async recover(){calls++}};
 const view=render(<App service={service}/>);submit();
 await waitFor(()=>expect(input('access-email').getAttribute('aria-invalid')).toBe('true'));
 expect(document.activeElement).toBe(input('access-email'));expect(calls).toBe(0);
 expect(input('access-email').getAttribute('aria-describedby')).toContain('access-email-message');
 typeInto(input('access-email'),'invalid');submit();
 await waitFor(()=>expect(view.getByText('Use a valid email address.')).toBeTruthy());
 expect(calls).toBe(0);
});
test('default service refuses honestly, retains input and never creates a success screen',async()=>{
 const view=render(<App/>);fill();submit();
 await waitFor(()=>expect(view.getByText('Sign-in service is not connected yet.')).toBeTruthy());
 expect(view.queryByText('You are signed in')).toBeNull();
 expect(input('access-password').value).toBe('test-secret-only');
});
test('pending submission is bounded and only confirmed service success clears the secret',async()=>{
 let calls=0,finish!:()=>void,continued=0;
 const service:AuthService={signIn:()=>{calls++;return new Promise<void>(resolve=>{finish=resolve})},async recover(){}};
 const view=render(<App service={service} onSignedIn={()=>{continued++}}/>);fill();
 const password=input('access-password');submit();submit();
 await waitFor(()=>expect(password.disabled).toBe(true));expect(calls).toBe(1);
 expect(view.queryByText('You are signed in')).toBeNull();finish();
 await waitFor(()=>expect(view.getByRole('heading',{name:'You are signed in'})).toBeTruthy());
 expect(password.value).toBe('');fireEvent.click(view.getByRole('button',{name:'Continue'}));expect(continued).toBe(1);
});
test('language and icon-only theme changes preserve draft fields and translate errors',async()=>{
 const view=render(<App/>);fill();const email=input('access-email'),password=input('access-password');submit();
 await waitFor(()=>expect(view.getByText('Sign-in service is not connected yet.')).toBeTruthy());
 const language=view.getByRole('combobox',{name:'Language'}) as HTMLSelectElement;language.value='ru';fireEvent.change(language);
 await waitFor(()=>expect(view.getByText('Сервис входа пока не подключён.')).toBeTruthy());
 expect(input('access-password')).toBe(password);expect(input('access-email')).toBe(email);expect(password.value).toBe('test-secret-only');
 const theme=view.getByRole('button',{name:'Включить тёмную тему'});expect(theme.textContent?.trim()).toBe('');fireEvent.click(theme);
 await waitFor(()=>expect(document.documentElement.classList.contains('dark-theme')).toBe(true));expect(password.value).toBe('test-secret-only');
});
test('recovery cancels a pending sign-in and ignores its late completion',async()=>{
 let finish!:()=>void,signal!:AbortSignal;
 const service:AuthService={signIn:(_,s)=>{signal=s;return new Promise<void>(resolve=>{finish=resolve})},async recover(){}};
 const view=render(<App service={service}/>);fill();submit();
 fireEvent.click(view.getByRole('button',{name:'Forgot password?'}));
 await waitFor(()=>expect(view.getByRole('heading',{name:'Reset your password'})).toBeTruthy());
 await waitFor(()=>expect(signal.aborted).toBe(true));finish();await tick();
 expect(view.queryByText('You are signed in')).toBeNull();expect(document.activeElement).toBe(view.getByRole('heading',{name:'Reset your password'}));
 typeInto(input('access-email'),'person@example.com');submit();
 await waitFor(()=>expect(view.getByRole('heading',{name:'Check your email'})).toBeTruthy());
 expect(view.getByText(/If an account exists/)).toBeTruthy();
});
test('rejected service response retains draft and allows a retry',async()=>{
 let calls=0;const service:AuthService={async signIn(){calls++;throw new AuthError('rejected')},async recover(){throw new AuthError('unavailable')}};
 const view=render(<App service={service}/>);fill();submit();
 await waitFor(()=>expect(view.getByText('Email or password is incorrect.')).toBeTruthy());
 expect(input('access-password').value).toBe('test-secret-only');submit();await tick();expect(calls).toBe(2);
 fireEvent.click(view.getByRole('button',{name:'Forgot password?'}));await tick();submit();
 await waitFor(()=>expect(view.getByText('Password recovery is not connected yet.')).toBeTruthy());
});
