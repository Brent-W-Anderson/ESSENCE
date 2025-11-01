import type AmmoFactory from 'ammojs3'
type AmmoModule = Awaited<ReturnType<AmmoFactory>>

declare global {
  interface Window {
    Ammo: AmmoFactory | Promise<AmmoModule> | AmmoModule;
  }
}

export {}