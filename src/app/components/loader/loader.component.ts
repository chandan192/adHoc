import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  @Input() busy = false;
  @Input() w = '100%';
  @Input() h = '100%';
  @Input() position = 'absolute';
  @Input() opacity = '0.2';
  @Input() top = '';
  @Input() z_index = '';
  chkButton = true;
  constructor() {
  }

  ngOnInit() {

  }

  exitLoop() {

  }
}
