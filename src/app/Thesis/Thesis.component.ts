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

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ThesisService } from './Thesis.service';
import 'rxjs/add/operator/toPromise';
import {AppService} from '../app-service';
import {StudentService} from '../Student/Student.service';
import {BookService} from '../Book/Book.service';
import {Book, Student, Supervisor, Thesis} from '../org.masterthesis.booker';
import {SupervisorService} from '../Supervisor/Supervisor.service';
import {CancelBookingService} from '../CancelBooking/CancelBooking.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-thesis',
  templateUrl: './Thesis.component.html',
  styleUrls: ['./Thesis.component.css'],
  providers: [ThesisService, StudentService, BookService, CancelBookingService]
})
export class ThesisComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
	private currentId;
	private errorMessage;
	public filteredAssets;

  thesisId;
  shortDescription = new FormControl('', Validators.required);
  longDescription = new FormControl('', Validators.required);
  student: Student;
  supervisor: Supervisor;
  studentsMap = new Map();
  doFilterTheses = false;

  constructor(public serviceThesis: ThesisService, fb: FormBuilder, private appService: AppService,
							private studentService: StudentService, private bookService: BookService, private cancelBookingService: CancelBookingService,
							private supervisorService: SupervisorService, private router: Router) {
    this.myForm = fb.group({
      shortDescription: this.shortDescription,
      longDescription: this.longDescription,
    });
  };

  ngOnInit(): void {
  	this.doFilterTheses = this.router.url.toString().indexOf('myTheses') > -1;
    this.loadAll();
    this.appService.studentSub.asObservable().subscribe((student) => {
    	this.student = student;
    	this.filterTheses(this.allAssets);
		});
    this.appService.supervisorSub.asObservable().subscribe((supervisor) => {
    	this.supervisor = supervisor;
			this.filterTheses(this.allAssets);
		});
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceThesis.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      result.forEach(asset => {
      	const indexOfHash = asset.supervisor.toString().indexOf('#');
      	this.supervisorService.getparticipant(asset.supervisor.toString().substr(indexOfHash + 1, 4))
					.toPromise()
					.then((sup) => {
						asset.supervisor = sup;
					});
        tempList.push(asset);
      });
      this.allAssets = tempList;
      console.log(tempList);
      this.filterTheses(tempList);
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.masterthesis.booker.Thesis',
      'shortDescription': this.shortDescription.value,
      'longDescription': this.longDescription.value,
			'supervisor': this.generateSupervisorString(this.supervisor)
    };

    this.asset.thesisId = this.generateId();
    console.log(this.asset);

    this.myForm.setValue({
      'shortDescription': null,
      'longDescription': null,
    });

    return this.serviceThesis.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.myForm.setValue({
        'shortDescription': null,
        'longDescription': null,
      });
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else {
          this.errorMessage = error;
      }
    });
  }


  updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.masterthesis.booker.Thesis',
      'shortDescription': this.shortDescription.value,
      'longDescription': this.longDescription.value,
			'supervisor': this.generateSupervisorString(this.supervisor)
    };

    return this.serviceThesis.updateAsset(this.thesisId, this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }


  deleteAsset(): Promise<any> {

    return this.serviceThesis.deleteAsset(this.currentId)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      this.loadAll();
    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  setId(id: any): void {
    this.currentId = id;
    this.thesisId = id;
    console.log(this.allAssets);
  }

  getForm(id: any): Promise<any> {

    return this.serviceThesis.getAsset(id)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      const formObject = {
        'shortDescription': null,
        'longDescription': null,
      };

      if (result.shortDescription) {
        formObject.shortDescription = result.shortDescription;
      } else {
        formObject.shortDescription = null;
      }

      if (result.longDescription) {
        formObject.longDescription = result.longDescription;
      } else {
        formObject.longDescription = null;
      }

      this.myForm.setValue(formObject);
      this.thesisId = id;

    })
    .catch((error) => {
      if (error === 'Server error') {
        this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
      } else if (error === '404 - Not Found') {
        this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
      } else {
        this.errorMessage = error;
      }
    });
  }

  resetForm(): void {
    this.myForm.setValue({
      'shortDescription': null,
      'longDescription': null,
      });
  }

  generateId() {
  	let random = 0;
		while (random < 1000) {
			random = Math.round(Math.random() * 10000);
		}
		return random.toString();
	}

	getStudentById(studentId: any) {
  	if (studentId === null || studentId === '-1') {
  		return 'Nie zarezerwowano';
		}

  	if (this.studentsMap.get(studentId)) {
  		return this.studentsMap.get(studentId);
		} else {
			this.studentService.getparticipant(studentId).subscribe((res) => {
				this.studentsMap.set(studentId, res.name);
				return this.studentsMap.get(studentId);
			});
		}
	}

	bookThesis() {
  	const book = {
			$class: 'org.masterthesis.booker.Book',
			'student': this.generateStudentString(this.student),
			'thesis': this.generateThesisString(this.allAssets.find((as) => as.thesisId === this.thesisId)),
			'timestamp': new Date().getDate()
	};
		return this.bookService.addTransaction(book)
			.toPromise()
			.then(() => {
				this.errorMessage = null;
				this.loadAll();
			})
			.catch((error) => {
				if (error === 'Server error') {
					this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
				} else {
					this.errorMessage = error;
				}
			});
	}
	cancelBooking() {
  	const cancelBooking = {
			$class: 'org.masterthesis.booker.CancelBooking',
			'student': this.generateStudentString(this.student),
			'thesis': this.generateThesisString(this.allAssets.find((as) => as.thesisId === this.thesisId)),
			'timestamp': new Date().getDate()
	};
		return this.cancelBookingService.addTransaction(cancelBooking)
			.toPromise()
			.then(() => {
				this.errorMessage = null;
				this.loadAll();
			})
			.catch((error) => {
				if (error === 'Server error') {
					this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
				} else {
					this.errorMessage = error;
				}
			});
	}

	generateSupervisorString(supervisor: Supervisor) {
		return '"resource:org.masterthesis.booker.Supervisor#' + supervisor.supervisorId + '"';
	}
	generateThesisString(thesis: Thesis) {
		return 'resource:org.masterthesis.booker.Thesis#' + thesis.thesisId;
	}
	generateStudentString(student: Student) {
  	return 'resource:org.masterthesis.booker.Student#' + student.studentId;
	}

	filterTheses(theses: Thesis[]) {
  	if (!this.doFilterTheses) {
			this.filteredAssets = theses;
		}
  	if (this.doFilterTheses && this.student != null) {
			this.filteredAssets = theses.filter((th) => th.studentID === this.student.studentId);
		}
  	if (this.doFilterTheses && this.supervisor != null) {console.log(theses)
  		this.filteredAssets = theses.filter((th) => th.supervisor.toString().substr(th.supervisor.toString().length - 4, th.supervisor.toString().length) === this.supervisor.supervisorId);
		}
	}

	triggerFilterTheses() {
  	this.doFilterTheses = !this.doFilterTheses;
	}

}
