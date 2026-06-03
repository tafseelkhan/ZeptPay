// services/soundService.ts
import { Platform, PermissionsAndroid } from 'react-native';
import Sound from 'react-native-sound';

export class SoundService {
  private static instance: SoundService;
  private soundRef: Sound | null = null;
  private soundLoaded: boolean = false;
  private soundError: string | null = null;

  private constructor() {}

  static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  async requestAndroidPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to play sounds',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  }

  async loadSound(soundPath: any): Promise<boolean> {
    try {
      const hasPermission = await this.requestAndroidPermission();
      if (!hasPermission && Platform.OS === 'android') {
        return false;
      }

      if (Platform.OS === 'ios') {
        Sound.setCategory('Playback', true);
      }

      Sound.setActive(true);

      return new Promise(resolve => {
        const sound = new Sound(soundPath, error => {
          if (error) {
            this.soundError = `Load failed: ${error.message}`;
            this.soundLoaded = false;
            resolve(false);
            return;
          }

          this.soundRef = sound;
          this.soundLoaded = true;
          this.soundError = null;
          resolve(true);
        });
      });
    } catch (error: any) {
      this.soundError = `Setup error: ${error.message}`;
      return false;
    }
  }

  playSound(): boolean {
    if (!this.soundRef || !this.soundLoaded) {
      return false;
    }

    try {
      this.soundRef.setCurrentTime(0);
      this.soundRef.play(success => {
        if (!success) {
          // Playback failed
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  releaseSound(): void {
    if (this.soundRef) {
      this.soundRef.release();
      this.soundRef = null;
      this.soundLoaded = false;
    }
  }

  getSoundStatus() {
    return {
      loaded: this.soundLoaded,
      error: this.soundError,
    };
  }
}
