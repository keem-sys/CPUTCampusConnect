package com.campusconnect.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Campus {
    CAPE_TOWN("District Six"),
    BELLVILLE("Bellville"),
    GRANGER_BAY("Granger Bay"),
    MOWBRAY("Mowbray"),
    WELLINGTON("Wellington"),
    ATHLONE("Athlone"),
    ONLINE("Online / Virtual");

    private final String displayName;
}