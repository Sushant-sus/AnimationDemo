import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {

}
