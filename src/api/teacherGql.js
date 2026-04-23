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


export const TEACHER_DASHBOARD_SUBSCRIPTION = gql`
  subscription GetTeacherDashboard($teacherId: uuid!) {
 academic_teachers(where: {user_id: {_eq: $teacherId}}) {
    id
    first_name
    last_name
    user {
      teacherassignments {
        section {
          id
          name
          grade {
            name
            id
            level_order
            school_id
            section
            section_id
          }
          studentenrollments_aggregate {
            aggregate {
              count
            }
          }
          grade_id
          studentenrollments {
            academic_year_id
            enrolled_at
            school_id
            section {
              id
              name
              school_id
              grade {
                id
                level_order
                name
                school_id
                section
              }
            }
          }
        }
        section_id
        subject {
          id
          name
          school_id
        }
      }
      teacherassignments_aggregate {
        aggregate {
          count
        }
      }
      created_at
      email
      first_name
      last_name
      id
      phone
      status
    }
    created_at
    email
    hire_date
    phone
    status
  }
}
`;



export const GET_TEACHER_SECTIONS = gql`
  query GetTeacherSections($teacherId: uuid!, $today: date!) {
    academic_teacherassignments(where: {teacher_id: {_eq: $teacherId}}) {
      id
      subject {
        name
      }
      section {
        id
        name
        grade {
          id
          name
          level_order
        }
        # Total number of students in this class
        studentenrollments_aggregate {
          aggregate {
            count
          }
        }
        # Number of attendance records created specifically for today
        attendances_aggregate(where: {date: {_eq: $today}}) {
          aggregate {
            count(columns: id)
          }
        }
      }
    }
  }
`;


export const SUBMIT_ATTENDANCE = gql`
  mutation MarkAttendance($objects: [academic_attendance_insert_input!]!) {
    insert_academic_attendance(
      objects: $objects, 
      on_conflict: { 
        constraint: attendance_student_section_date_key, 
        update_columns: [status, remarks] 
      }
    ) {
      affected_rows
    }
  }
`;

export const GET_SECTION_ROSTER = gql`
  query GetSectionRoster($sectionId: uuid!) {
    academic_sections_by_pk(id: $sectionId) {
      id
      name
      grade {
        name
      }
      studentenrollments {
        student {
          id
          first_name
          last_name
          admission_number
        }
      }
    }
  }
`;

export const GET_CLASS_ROSTER = gql`
  query GetClassRoster($sectionId: uuid!) {
    academic_sections_by_pk(id: $sectionId) {
      id
      name
      grade {
        name
      }
      # Fetching students through the enrollment table
      studentenrollments {
        student {
          id
          first_name
          last_name
          admission_number
          gender
          status
          date_of_birth
          user{
          email
          }
        }
      }
    }
  }
`;