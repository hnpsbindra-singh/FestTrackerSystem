package com.testing.springpractice.festtracker.dataTranseferObjects.EmailDataTransferObjects;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sender {
    private String name;
    private String email;
}
