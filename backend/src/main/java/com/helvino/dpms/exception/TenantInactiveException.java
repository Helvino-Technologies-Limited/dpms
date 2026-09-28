package com.helvino.dpms.exception;

/** The user's clinic is expired, suspended or cancelled. */
public class TenantInactiveException extends RuntimeException {
    public static final String CODE = "TENANT_INACTIVE";

    public TenantInactiveException(String message) {
        super(message);
    }
}
