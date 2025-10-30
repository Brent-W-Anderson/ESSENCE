// Types only; no runtime import.
import type AmmoFactory from 'ammojs-typed'

// Your backend-injected <script> defines window.Ammo = AmmoFactory
declare global {
  interface Window {
    Ammo: AmmoFactory;
  }
}

export {}