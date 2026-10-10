package com.campusconnect.dto.response;

import java.util.List;
import java.util.Map;

public record AdminStatsResponse(
        long totalStudents,
        long totalOrganizers,
        long totalEvents,
        long totalRsvps,
        Map<String, Long> eventsByCampus,
        List<EventResponse> recentEvents,
        List<UserProfileResponse> recentUsers
) {}