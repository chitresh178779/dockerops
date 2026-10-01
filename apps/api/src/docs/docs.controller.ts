import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { DOC_PAGES } from "./docs.data";

@Controller("docs")
export class DocsController {
  @Get()
  getAll() {
    return DOC_PAGES;
  }

  @Get(":slug")
  getOne(@Param("slug") slug: string) {
    const page = DOC_PAGES.find((p) => p.slug === slug);
    if (!page) throw new NotFoundException("Doc page not found");
    return page;
  }
}
