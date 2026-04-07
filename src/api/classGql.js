import { gql } from '@apollo/client';

export const CREATE_CLASSES_BULK = gql`
  mutation CreateClassesBulk($object: ClassesBulkInput!) {
    CreateClassesBulkAction(object: $object) {
      results
      classes { 
        id 
        name 
        capacity 
      }
    }
  }
`;

export const GET_CLASSES_FULL_DATA = gql`
  query GetClassesFullData {
    academic_classes(order_by: {created_at: desc}) {
      id
      name
      capacity
      academicyear {
        id
        name
        status
      }
      section {
        id
        name
        grade {
          id
          name
        }
        studentenrollments_aggregate {
          aggregate {
            count
          }
        }
        teacherassignments {
          user {
            first_name
            last_name
          }
          subject {
            name
          }
        }
      }
    }
    academic_academicyears(where: {status: {_eq: "active"}}) {
      id
      name
    }
  }
`;



export const ASSIGN_TEACHER = gql`
  mutation AssignTeacher($section_id: uuid!, $subject_id: uuid!, $teacher_user_id: uuid!) {
    AssignTeacherAction(object: {
      section_id: $section_id, 
      subject_id: $subject_id, 
      teacher_user_id: $teacher_user_id
    }) {
      assignment_id
    }
  }
`;

// You'll also need to fetch Subjects and Teachers for the dropdowns
export const GET_ASSIGNMENT_METADATA = gql`
  query GetAssignmentMetadata {
    academic_subjects {
      id
      name
    }
    # Fetching users filtered by the 'teacher' role
    identity_userroles(where: {role: {name: {_eq: "TEACHER"}}}) {
      user {
        id
        teacher {
          id
          user_id
          first_name
          last_name
          email
          status
        }
      }
    }
  }
`;