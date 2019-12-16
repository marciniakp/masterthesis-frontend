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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';

import { ThesisComponent } from './Thesis/Thesis.component';

import { SupervisorComponent } from './Supervisor/Supervisor.component';
import { StudentComponent } from './Student/Student.component';

import { BookComponent } from './Book/Book.component';
import { CancelBookingComponent } from './CancelBooking/CancelBooking.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Thesis', component: ThesisComponent },
  { path: 'Supervisor', component: SupervisorComponent },
  { path: 'Student', component: StudentComponent },
  { path: 'Book', component: BookComponent },
  { path: 'CancelBooking', component: CancelBookingComponent },
  { path: 'myTheses', component: ThesisComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule],
 providers: []
})
export class AppRoutingModule { }
