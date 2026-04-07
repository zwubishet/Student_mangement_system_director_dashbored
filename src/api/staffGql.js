import { gql } from '@apollo/client';

export const GET_STAFF_AND_DIRECTORS = gql`
  query GetStaffAndDirectors {
    # 1. Fetch Teachers with their School and User context
    academic_teachers {
      id
      first_name
      last_name
      email
      status
      hire_date
      user {
        status
        userroles {
          role {
            name
          }
        }
      }
    }
    # 2. Fetch Directors (Users with the Director role)
    identity_users(where: {userroles: {role: {name: {_ilike: "%director%"}}}}) {
      id
      first_name
      last_name
      email
      status
      userroles {
        role {
          name
        }
      }
    }
  }
`;

export const CREATE_TEACHER_MUTATION = gql`
  mutation CreateTeacher($object: TeacherInput!) {
    CreateTeacherAction(object: $object) {
      teacher_id
      user_id
      email
    }
  }
`;