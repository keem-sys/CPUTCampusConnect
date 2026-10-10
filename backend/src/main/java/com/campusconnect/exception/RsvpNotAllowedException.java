package com.campusconnect.exception;

public class RsvpNotAllowedException extends RuntimeException {

    public RsvpNotAllowedException() {
        super("Only students can RSVP to campus events.");
    }

    public RsvpNotAllowedException(String message) {
        super(message);
    }
}