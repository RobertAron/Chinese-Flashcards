import { AppServerLayoutEntrypoint } from "@/components/AppPage";
import { CourseTitleLink, DrillLink, LessonLink } from "./SideNavLink";
import { getCourseOutline } from "./getCourseOutline";
import { paramsTemplate } from "./paramsTemplate";

export default AppServerLayoutEntrypoint(async ({ children, params }) => {
  const { courseSlug } = paramsTemplate.parse(await params);
  const course = await getCourseOutline(courseSlug);
  return (
    <div className="flex grow items-stretch">
      <div className="flex w-64 shrink-0 flex-col gap-2 border-black border-r">
        <CourseTitleLink courseSlug={course.slug}>{course.title}</CourseTitleLink>
        {course.lessons.map((lesson) => (
          <div className="flex flex-col" key={lesson.title}>
            <LessonLink courseSlug={courseSlug} lessonSlug={lesson.slug} title={lesson.title} />
            <ul className="flex flex-col">
              {lesson.drills.map((drill) => (
                <DrillLink
                  key={drill.slug}
                  courseSlug={courseSlug}
                  lessonSlug={lesson.slug}
                  drillSlug={drill.slug}
                  title={drill.title}
                />
              ))}
              <DrillLink
                courseSlug={courseSlug}
                lessonSlug={lesson.slug}
                drillSlug={`final-mastery-${lesson.slug}`}
                title="Final Mastery"
              />
            </ul>
          </div>
        ))}
      </div>
      <div className="flex grow flex-col px-3">{children}</div>
    </div>
  );
});
