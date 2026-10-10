package com.campusconnect.exception;

public class OrganizerRsvpNotAllowedException extends RuntimeException {
    public OrganizerRsvpNotAllowedException() {
        super("Organizers cannot RSVP to events.");
    }
}
