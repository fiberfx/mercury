import {useEffect, useId, useMemo, useRef, useState} from '@fiberfx/hyperscript/hooks';
import {dispose, fork, type Scope} from '@fiberfx/hypergraph';
import {Provider, useUnit} from '@fiberfx/hypergraph/hyperscript';
import {reflect} from '@fiberfx/reflect';
import {Alert, Button, Input, PasswordField, Select} from '@fiberfx/ui';
import {$locale,$dark,$screen,localeChanged,themeChanged,screenChanged,type Locale,type Screen} from './model.ts';
import {AuthError,unavailableAuth,type AuthService} from './auth.ts';
import {t} from './copy.ts';

function Mark() {
  return <svg width="30" height="30" viewBox="5 9 30 23" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M7 29V15.5a4.5 4.5 0 0 1 9 0V29m0-12.5c0-3 2-5.5 4.5-5.5"/><path class="access-accent" d="M23 16l10 13M33 16L23 29"/></svg>;
}
function ThemeIcon({dark}:{dark:boolean}) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true" focusable="false">{dark ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></> : <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>}</svg>;
}
type FormProps = {locale:Locale; screen:Screen; navigate:(screen:Screen)=>void; service:AuthService; onSignedIn:()=>void};
function AccessForm({locale,screen,navigate,service,onSignedIn}:FormProps) {
  const tr=(text:string)=>t(locale,text), recovery=screen==='recovery';
  const email=useRef<HTMLInputElement>(null), password=useRef<HTMLInputElement>(null), heading=useRef<HTMLHeadingElement>(null);
  const request=useRef<AbortController|null>(null), active=useRef(true), previousScreen=useRef(screen);
  const [errors,setErrors]=useState({email:'',password:''});
  const [phase,setPhase]=useState<'idle'|'pending'|'success'>('idle');
  const [failure,setFailure]=useState('');
  useEffect(()=>{active.current=true;return()=>{active.current=false;request.current?.abort();};},[]);
  useEffect(()=>{
    if(previousScreen.current!==screen) {
      request.current?.abort();request.current=null;setPhase('idle');setFailure('');setErrors({email:'',password:''});
      if(password.current) password.current.value='';
      heading.current?.focus({preventScroll:true});
    }
    previousScreen.current=screen;
  },[screen]);
  useEffect(()=>{if(phase==='success') heading.current?.focus({preventScroll:true});},[phase]);
  async function submit(event:Event) {
    event.preventDefault();if(request.current) return;
    const address=email.current?.value.trim()??'';
    const next={email:!address?'Enter your email address.':email.current?.validity.typeMismatch?'Use a valid email address.':'',password:!recovery&&!password.current?.value?'Enter your password.':''};
    setErrors(next);setFailure('');
    if(next.email||next.password){(next.email?email:password).current?.focus();return;}
    const controller=new AbortController();request.current=controller;setPhase('pending');
    try {
      if(recovery) await service.recover(address,controller.signal);
      else await service.signIn({email:address,password:password.current!.value},controller.signal);
      if(!active.current||controller.signal.aborted||request.current!==controller) return;
      if(password.current) password.current.value='';
      setPhase('success');
    } catch(error) {
      if(!active.current||controller.signal.aborted||request.current!==controller) return;
      setPhase('idle');
      setFailure(error instanceof AuthError && error.code==='unavailable' ? (recovery?'Password recovery is not connected yet.':'Sign-in service is not connected yet.')
        : error instanceof AuthError && error.code==='rejected' ? 'Email or password is incorrect.' : 'We could not connect. Please try again.');
    } finally {if(request.current===controller) request.current=null;}
  }
  const title=phase==='success'?(recovery?'Check your email':'You are signed in'):(recovery?'Reset your password':'Sign in to Mercury');
  return <section class="access-form" aria-labelledby="access-title">
    <div class="access-form-intro"><p class="access-eyebrow">{tr('Welcome back')}</p><h1 id="access-title" ref={heading} tabindex={-1}>{tr(title)}</h1>
      <p>{tr(phase==='success'?(recovery?'If an account exists for this address, you will receive a reset link.':'Your session is ready.'):(recovery?'Enter your email to request a reset link.':'Your work, ready when you are.'))}</p>
    </div>
    {phase==='success' ? <div class="access-stack"><Button fullWidth size="lg" onClick={recovery?()=>navigate('login'):onSignedIn}>{tr(recovery?'Back to sign in':'Continue')}</Button></div>
      : <form class="access-stack" noValidate onSubmit={submit} aria-busy={phase==='pending'}>
        {(errors.email||errors.password)&&<p role="alert" class="access-error-summary">{tr('Check the highlighted fields.')}</p>}
        {failure&&<Alert tone="danger">{tr(failure)}</Alert>}
        <Input key="email" id="access-email" ref={email} class="access-field" label={tr('Email')} name="username" type="email" autoComplete="username" required disabled={phase==='pending'}
          style={{minHeight:'3rem',fontSize:'1rem'}} error={errors.email?tr(errors.email):undefined} onInput={()=>setErrors(e=>({...e,email:''}))}/>
        {!recovery&&<PasswordField key="password" id="access-password" ref={password} class="access-field" label={tr('Password')} name="password" autoComplete="current-password" required disabled={phase==='pending'}
          style={{minHeight:'3rem',fontSize:'1rem'}} toggleLabel={tr('Show password')} error={errors.password?tr(errors.password):undefined} onInput={()=>setErrors(e=>({...e,password:''}))}/>}
        {!recovery&&<div class="access-recovery-link"><Button variant="ghost" size="sm" onClick={()=>navigate('recovery')}>{tr('Forgot password?')}</Button></div>}
        <Button type="submit" fullWidth size="lg" loading={phase==='pending'} aria-label={tr(phase==='pending'?(recovery?'Sending…':'Signing in…'):(recovery?'Send reset link':'Sign in'))}>{tr(phase==='pending'?(recovery?'Sending…':'Signing in…'):(recovery?'Send reset link':'Sign in'))}</Button>
        <p class="access-status" role="status">{phase==='pending'?tr(recovery?'Sending…':'Signing in…'):''}</p>
        {recovery&&<Button variant="ghost" onClick={()=>navigate('login')}>{tr('Back to sign in')}</Button>}
      </form>}
  </section>;
}
const BoundForm=reflect({view:AccessForm,bind:{locale:$locale,screen:$screen,navigate:screenChanged}});
function Shell({service,onSignedIn}:{service:AuthService;onSignedIn:()=>void}) {
  const {locale,dark,setLocale,setDark}=useUnit({locale:$locale,dark:$dark,setLocale:localeChanged,setDark:themeChanged});
  const tr=(text:string)=>t(locale,text),themeLabel=tr(dark?'Switch to light theme':'Switch to dark theme');
  useEffect(()=>{document.documentElement.lang=locale;document.title=`${tr('Sign in')} · Mercury`;document.documentElement.classList.toggle('dark-theme',dark);document.documentElement.classList.toggle('light-theme',!dark);},[locale,dark]);
  return <div class="access-app"><a class="access-skip" href="#access-title">{tr('Skip to sign in')}</a>
    <header class="access-header"><a class="access-brand" href="#access-title" aria-label="Mercury"><Mark/><span>mercury</span></a>
      <div class="access-header-actions"><Select aria-label={tr('Language')} value={locale} options={[{value:'en',label:'English'},{value:'ru',label:'Русский'}]}
        onChange={event=>{const value=event.currentTarget.value as Locale;setLocale(value);const url=new URL(location.href);url.searchParams.set('lang',value);history.replaceState(null,'',url);}}/>
        <Button class="access-theme" variant="ghost" aria-label={themeLabel} title={themeLabel} leading={<ThemeIcon dark={dark}/>} onClick={()=>setDark(!dark)}/>
      </div></header>
    <main id="main"><BoundForm service={service} onSignedIn={onSignedIn}/></main>
    <footer class="access-footer">{tr('Built by Jonnify')}</footer>
  </div>;
}
type InspectorSession={registerScope:(input:{id:string;label:string;scope:Scope})=>(()=>void)};
export default function App({service=unavailableAuth,onSignedIn=()=>{location.assign('/app');}}:{service?:AuthService;onSignedIn?:()=>void}={}) {
  const id=useId();
  const {scope,release}=useMemo(()=>{
    const scope=fork({values:[[$locale,new URLSearchParams(location.search).get('lang')==='ru'?'ru':'en'],[$dark,document.documentElement.classList.contains('dark-theme')]]});
    const inspector=(globalThis as typeof globalThis & {__MERCURY_INSPECTOR__?:InspectorSession}).__MERCURY_INSPECTOR__;
    return {scope,release:inspector?.registerScope({id:`access-app/${id}`,label:'Access',scope})};
  },[]);
  useEffect(()=>()=>{release?.();dispose(scope);},[scope,release]);
  return <Provider value={scope}><Shell service={service} onSignedIn={onSignedIn}/></Provider>;
}
