import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  DocumentReference,
  QuerySnapshot,
  DocumentData,
  getDoc
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { EventModel } from '../event.model';
import { Event } from '../event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private eventsCollection = 'events';

  createEvent(eventData: Omit<Event, 'id' | 'createdBy' | 'createdAt'>): Observable<string> {
    const userEmail = this.authService.getEmail();

    if (!userEmail) {
      return throwError(() => new Error('User not authenticated'));
    }

    const currentUser = this.authService.getCurrentUser();

    const newEvent = new EventModel(
      eventData.title,
      eventData.date,
      eventData.time,
      eventData.location,
      eventData.description,
      userEmail
    );


    const eventsRef = collection(this.firestore, this.eventsCollection);

    return from(addDoc(eventsRef, newEvent.toFirestore())).pipe(
      map((docRef: DocumentReference) => {
        return docRef.id;
      }),
      catchError((error) => {
        console.error('Detailed Firebase error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);

        let userFriendlyMessage = 'Failed to create event. ';

        if (error.code === 'permission-denied') {
          userFriendlyMessage += 'Permission denied. Please check Firebase security rules.';
        } else if (error.code === 'unauthenticated') {
          userFriendlyMessage += 'User not authenticated. Please log in again.';
        } else {
          userFriendlyMessage += error.message;
        }

        return throwError(() => new Error(userFriendlyMessage));
      })
    );
  }

  getUserEvents(): Observable<EventModel[]> {
    const userEmail = this.authService.getEmail();

    if (!userEmail) {
      return throwError(() => new Error('User not authenticated'));
    }

    const eventsRef = collection(this.firestore, this.eventsCollection);
    const q = query(
      eventsRef,
      where('createdBy', '==', userEmail),
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => {
        return querySnapshot.docs.map(doc => {
          return EventModel.fromFirestore(doc.data(), doc.id);
        });
      }),
      catchError((error) => {
        console.error('Error getting events:', error);

        if (error.code === 'failed-precondition') {
          console.error('Index might be missing. Check Firestore indexes.');
        }

        return throwError(() => error);
      })
    );
  }

  updateEvent(eventId: string, eventData: Partial<Event>): Observable<void> {
    const eventRef = doc(this.firestore, this.eventsCollection, eventId);
    const updateData = {
      ...eventData,
      updatedAt: new Date()
    };

    return from(updateDoc(eventRef, updateData)).pipe(
      catchError((error) => {
        console.error('Error updating event:', error);
        return throwError(() => error);
      })
    );
  }

  deleteEvent(eventId: string): Observable<void> {
    const eventRef = doc(this.firestore, this.eventsCollection, eventId);
    return from(deleteDoc(eventRef)).pipe(
      catchError((error) => {
        console.error('Error deleting event:', error);
        return throwError(() => error);
      })
    );
  }

  canEditEvent(event: EventModel): boolean {
    const userEmail = this.authService.getEmail();
    return userEmail === event.createdBy;
  }
}
