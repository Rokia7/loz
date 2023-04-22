import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

// Services
import { DataService } from '../../services/data.service';
import { LocaleUtilsService } from '../../services/locale-utils.service';
import { NotifyService } from '../../services/notify.service';
import { StorageService } from '../../services/storage.service';

// Utils
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, debounceTime, filter, map } from 'rxjs/operators';

@Component({
  selector: 'translation-add-dialog',
  templateUrl: './translation-add.dialog.html',
  styleUrls: ['./translation-add.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationAddDialog implements OnInit, OnDestroy {
  @ViewChild('input') input?: ElementRef;
  @HostListener('document:keypress', ['$event']) onKeypressHandler(event: KeyboardEvent) {
    if (event.ctrlKey && event.code === 'KeyU') {
      this.typeFormat.setValue('uppercase');
    }

    if (event.ctrlKey && event.code === 'KeyL') {
      this.typeFormat.setValue('lowercase');
    }

    if (event.ctrlKey && event.code === 'KeyN') {
      this.typeFormat.setValue('none');
    }
  };

  typeFormat = new FormControl('none');
  listSub = new Map;

  translationId = new FormControl('', [Validators.required]);

  onTranslationIdChange$ = new BehaviorSubject(undefined);

  isDirty = false;
  isValid$ = new BehaviorSubject(undefined);

  constructor(
    private dialogRef: MatDialogRef<TranslationAddDialog>,
    private data: DataService,
    private localeUtils: LocaleUtilsService,
    private notify: NotifyService,
    private storage: StorageService
  ) { }

  ngOnInit() {
    this.init();
    this.initListeners();
  }

  ngOnDestroy() {
    this.listSub.forEach((item: any) => {
      item.unsubscribe();
    });
  }

  init() {
    const currentNode = this.data.currentNode$.value;

    if (currentNode && currentNode.path) {
      this.translationId.setValue(`${currentNode.path}.`);
    }

    const typeFormat = this.storage.get('typeFormat');
    this.typeFormat.setValue(typeFormat ? typeFormat : 'none');
  }

  initListeners() {
    this.listSub.set('subTranslationId', this.translationId.valueChanges
      .pipe(
        filter(d => d !== undefined && d !== ''),
        distinctUntilChanged(),
        debounceTime(0)
      ).subscribe((value: string) => {
        this.isDirty = true;
        this.isValid$.next(this.localeUtils.isValidLocaleKey(value));
        const typeFormat = this.typeFormat.value;
        this.translationId.setValue(this.textFormat(typeFormat, value));
      }));

    this.listSub.set('subTranslationId', this.typeFormat.valueChanges.subscribe((type: string) => {
      this.input?.nativeElement.focus();
      if (this.translationId.valid) {
        const translationId = this.translationId.value;
        this.storage.set('typeFormat', this.typeFormat.value);
        this.translationId?.setValue(this.textFormat(type, translationId));
      }
    }));
  }

  textFormat(type = 'uppercase' || 'lowercase' || 'none', value: string) {
    const listValue = value.split('.');
    let newText = '';
    const lengthList = listValue.length;

    for (let i = 0; i < lengthList - 1; i++) {
      newText += listValue[i]+'.'
    }

    switch (type) {
      case 'uppercase':
        newText += listValue[lengthList-1].toUpperCase();
        break;
      case 'lowercase':
        newText += listValue[lengthList-1].toLowerCase();
        break;
      default:
        newText += listValue[lengthList-1];
        break;
    }

    return newText;
  }

  create() {
    if (!this.isDirty) {
      this.isValid$.next(this.localeUtils.isValidLocaleKey(this.translationId.value));
      return;
    }

    if (!this.isValid$.value || !this.localeUtils.isValidLocaleKey(this.translationId.value)) {
      return;
    }

    // Check if key is existed
    if (this.data.isExistedKey(this.translationId.value)) {
      this.notify.pushNotify('NOTIFY.TRANSLATION_ID_EXISTED');
      return;
    }

    this.close();
    this.data.addId(this.translationId.value);
  }

  close() {
    this.dialogRef.close();
  }
}
