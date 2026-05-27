import { Component, inject, computed } from '@angular/core';
import { ChangelogService } from '../../services/changelog.service';
import { ButtonComponent } from '../ui/button/button.component';
import { CHANGELOG } from '../../changelog';

@Component({
  selector: 'neo-changelog',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './changelog.component.html',
  styleUrl: './changelog.component.css'
})
export class ChangelogComponent {
  changelogService = inject(ChangelogService);

  title = computed(() => {
    return this.changelogService.viewMode() === 'updates' 
      ? "What's New in Neo!" 
      : 'Version History';
  });

  displayedEntries = computed(() => {
    return this.changelogService.viewMode() === 'updates'
      ? this.changelogService.unseenEntries()
      : CHANGELOG;
  });

  close() {
    this.changelogService.close();
  }
}
