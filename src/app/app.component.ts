/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, AfterViewInit } from '@angular/core';
import $ from 'jquery';
import {Student, Supervisor} from './org.masterthesis.booker';
import {StudentService} from './Student/Student.service';
import {Participant} from './org.hyperledger.composer.system';
import {SupervisorService} from './Supervisor/Supervisor.service';
import {AppService} from './app-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
	providers: [StudentService, SupervisorService]
})
export class AppComponent {
	title = 'app works!';
	studentContext = false;
	supervisorContext = false;
	buttonText = 'Zmień na tryb student';
	supervisor1: Supervisor;
	supervisor2: Supervisor;
	student1: Student;
	student2: Student;
	dropdownLabel = 'Wybierz użytkownika'


	constructor(private serviceStudent: StudentService,
							private serviceSupervison: SupervisorService,
							private appService: AppService,
							private route: Router) {
		this.supervisor1 = {
			supervisorId: '1000',
			name: 'Jan Nowak',
			title: 'dr inż.',
			department: 'Wydział Informatyki'
		};
		this.supervisor2 = {
			supervisorId: '1001',
			name: 'Andrzej Kowalski',
			title: 'dr',
			department: 'Wydział Elektryczny'
		};
		this.student1 = {
			studentId: '2000',
			name: 'Przemysław Marciniak',
			index: '117113',
			specialization: 'ZTI'
		};
		this.student2 = {
			studentId: '2001',
			name: 'Kamil Kędzierski',
			index: '117113',
			specialization: 'ZTI'
		};
	}

	addStudent(participant: Student) {
		this.dropdownLabel = participant.name;
		this.studentContext = true;
		this.supervisorContext = false;
		this.appService.setActiveStudent(participant);
		this.serviceStudent.getparticipant(participant.studentId).toPromise().then().catch(() => {
			return this.serviceStudent.addParticipant(participant)
				.toPromise();
		});
		this.route.navigateByUrl('/Thesis');
	}

	addSupervisor(participant: Supervisor) {
		this.dropdownLabel = participant.title + ' ' + participant.name;
		this.studentContext = false;
		this.supervisorContext = true;
		this.appService.setActiveSupervisor(participant);
		this.serviceSupervison.getparticipant(participant.supervisorId).toPromise().then().catch(() => {
			return this.serviceSupervison.addParticipant(participant)
				.toPromise();
		});
		this.route.navigateByUrl('/Thesis');
	}
}
