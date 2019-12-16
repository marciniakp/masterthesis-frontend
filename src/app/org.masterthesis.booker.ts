import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.masterthesis.booker{
   export class Thesis extends Asset {
      thesisId: string;
      shortDescription: string;
      longDescription: string;
      supervisor: Supervisor;
      studentID: string;
   }
   export class Supervisor extends Participant {
      supervisorId: string;
      name: string;
      title: string;
      department: string;
   }
   export class Student extends Participant {
      studentId: string;
      name: string;
      index: string;
      specialization: string;
   }
   export class Book extends Transaction {
      student: Student;
      thesis: Thesis;
   }
   export class CancelBooking extends Transaction {
      student: Student;
      thesis: Thesis;
   }
// }
