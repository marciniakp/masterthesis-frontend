import {Injectable} from '@angular/core';
import {Student, Supervisor} from './org.masterthesis.booker';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class AppService {

	studentSub = new BehaviorSubject<Student>(null);
	supervisorSub = new BehaviorSubject<Supervisor>(null);

	constructor() {
	}

	setActiveStudent(student: Student) {
		this.studentSub.next(student);
		this.supervisorSub.next(null);

	}
	setActiveSupervisor(supervisor: Supervisor) {
		this.supervisorSub.next(supervisor);
		this.studentSub.next(null);
	}
}
