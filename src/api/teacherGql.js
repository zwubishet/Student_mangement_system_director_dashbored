import { gql } from '@apollo/client';

// FIXED: Changed CreateTeacherInput to TeacherInput
export const CREATE_TEACHER = gql`
  mutation CreateTeacher($object: TeacherInput!) {
    CreateTeacherAction(object: $object) {
      teacher_id
      user_id
      email
    }
  }
`;

export const GET_TEACHERS = gql`
  query GetTeachers {
    academic_teachers(order_by: {created_at: desc}) {
      id
      first_name
      last_name
      email
      phone
      hire_date
      status
      user {
        status
      }
    }
  }
`;