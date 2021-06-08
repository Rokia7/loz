import { Component, OnInit } from '@angular/core';

// Services
import {
  ElectronService,
  LoaderService,
  SettingService,
  TranslateService,
} from './core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private loader: LoaderService,
    private setting: SettingService,
  ) {
    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  ngOnInit() {
    this.setting.init();
    this.translate.init();
    this.loader.init();
  }
}
