package com.warehouse.dtos;

import com.warehouse.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUserDTO {
    private Long id;
    private String name;
    private String email;
    private String password;
    private Role role;
    private int taskCount;
}
