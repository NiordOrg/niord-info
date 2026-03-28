import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageAttachmentComponent } from './message-attachment.component';
import { AttachmentVo } from '../../../../core/models/message.model';

describe('MessageAttachmentComponent', () => {
  let fixture: ComponentFixture<MessageAttachmentComponent>;
  let component: MessageAttachmentComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MessageAttachmentComponent],
    });
    fixture = TestBed.createComponent(MessageAttachmentComponent);
    component = fixture.componentInstance;
  });

  it('should render image for image type', () => {
    const att: AttachmentVo = { path: '/img/test.png', fileName: 'test.png', type: 'image/png' };
    fixture.componentRef.setInput('attachment', att);
    fixture.detectChanges();
    expect(component.sourceType()).toBe('image');
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
  });

  it('should render video for video type', () => {
    const att: AttachmentVo = { path: '/vid/test.mp4', fileName: 'test.mp4', type: 'video/mp4' };
    fixture.componentRef.setInput('attachment', att);
    fixture.detectChanges();
    expect(component.sourceType()).toBe('video');
    expect(fixture.nativeElement.querySelector('video')).toBeTruthy();
  });

  it('should include width/height in style when set', () => {
    const att: AttachmentVo = { path: '/img/test.png', fileName: 'test.png', width: '300px', height: '200px' };
    fixture.componentRef.setInput('attachment', att);
    fixture.detectChanges();
    const style = component.sourceStyle();
    expect(style['width']).toBe('300px');
    expect(style['height']).toBe('200px');
  });

  it('should render caption when present', () => {
    const att: AttachmentVo = {
      path: '/img/test.png',
      fileName: 'test.png',
      descs: [{ lang: 'en', caption: 'A photo' }],
    };
    fixture.componentRef.setInput('attachment', att);
    fixture.detectChanges();
    expect(component.caption()).toBe('A photo');
    expect(fixture.nativeElement.textContent).toContain('A photo');
  });
});
