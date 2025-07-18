import { saveAs } from 'file-saver';
import { ExportStrategy, ExportOptions, ExportResult, ExportFormat } from '../index';
import { Editor } from '@tiptap/react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';

export class DocxExportStrategy extends ExportStrategy {
  getSupportedFormats(): ExportFormat[] {
    return ['docx'];
  }

  async export(content: any, options: ExportOptions): Promise<ExportResult> {
    try {
      let htmlContent: string;
      let articleTitle = 'Untitled Article';

      // Handle different content types
      if (typeof content === 'string') {
        htmlContent = content;
      } else if (content?.editor && content.editor instanceof Editor) {
        htmlContent = content.editor.getHTML();
        articleTitle = content.title || articleTitle;
      } else if (content?.html) {
        htmlContent = content.html;
        articleTitle = content.title || articleTitle;
      } else if (content?.json) {
        const tempEditor = new Editor({
          content: content.json,
          editable: false,
        });
        htmlContent = tempEditor.getHTML();
        tempEditor.destroy();
        articleTitle = content.title || articleTitle;
      } else {
        throw new Error('Unsupported content format for DOCX export');
      }

      // Create DOCX document
      const docxBlob = await this.createDocxFromHtml(htmlContent, articleTitle, options);

      const filename = this.generateFilename(
        articleTitle, 
        'docx', 
        options.customFilename
      );

      // Trigger download
      saveAs(docxBlob, filename);

      return {
        success: true,
        filename,
        blob: docxBlob,
        metadata: this.createMetadata('docx', '', content.articleId, articleTitle),
      };
    } catch (error) {
      console.error('DOCX export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown DOCX export error',
      };
    }
  }

  private async createDocxFromHtml(
    htmlContent: string, 
    title: string, 
    options: ExportOptions
  ): Promise<Blob> {
    // Parse HTML to extract content elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Create document sections
    const sections: any[] = [];
    
    // Add title section
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 32, // 16pt in half-points
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400, // 20pt spacing after
        },
      })
    );

    // Add metadata if requested
    if (options.includeMetadata) {
      const now = new Date();
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Exported: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
              size: 18, // 9pt
              color: '666666',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Format: Microsoft Word Document',
              size: 18, // 9pt
              color: '666666',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 800, // Extra spacing before content
          },
        })
      );
    }

    // Process HTML elements
    const contentElements = this.processHtmlElements(doc.body.children);
    sections.push(...contentElements);

    // Add footer
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated by BOFU Article Editor on ${new Date().toLocaleDateString()}`,
            size: 16, // 8pt
            color: '999999',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 800,
        },
      })
    );

    // Create document
    const document = new Document({
      creator: 'BOFU Article Editor',
      title,
      description: `Exported article: ${title}`,
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    // Generate and return blob
    const buffer = await Packer.toBlob(document);
    return buffer;
  }

  private processHtmlElements(elements: HTMLCollectionOf<Element>): any[] {
    const docxElements: any[] = [];

    Array.from(elements).forEach(element => {
      switch (element.tagName.toLowerCase()) {
        case 'h1':
          docxElements.push(this.createHeading(element.textContent || '', HeadingLevel.HEADING_1));
          break;
        case 'h2':
          docxElements.push(this.createHeading(element.textContent || '', HeadingLevel.HEADING_2));
          break;
        case 'h3':
          docxElements.push(this.createHeading(element.textContent || '', HeadingLevel.HEADING_3));
          break;
        case 'h4':
          docxElements.push(this.createHeading(element.textContent || '', HeadingLevel.HEADING_4));
          break;
        case 'h5':
          docxElements.push(this.createHeading(element.textContent || '', HeadingLevel.HEADING_5));
          break;
        case 'h6':
          docxElements.push(this.createHeading(element.textContent || '', HeadingLevel.HEADING_6));
          break;
        case 'p':
          docxElements.push(this.createParagraph(element));
          break;
        case 'ul':
        case 'ol':
          docxElements.push(...this.createList(element));
          break;
        case 'blockquote':
          docxElements.push(this.createBlockquote(element.textContent || ''));
          break;
        case 'pre':
          docxElements.push(this.createCodeBlock(element.textContent || ''));
          break;
        case 'table':
          docxElements.push(this.createTable(element as HTMLTableElement));
          break;
        case 'hr':
          docxElements.push(this.createHorizontalRule());
          break;
        default:
          // For other elements, try to extract text content
          const textContent = element.textContent?.trim();
          if (textContent) {
            docxElements.push(this.createParagraph(element));
          }
          break;
      }
    });

    return docxElements;
  }

  private createHeading(text: string, level: HeadingLevel): Paragraph {
    // Use a simple switch statement to avoid HeadingLevel type issues
    let fontSize = 24; // default
    switch (level) {
      case HeadingLevel.HEADING_1:
        fontSize = 32; // 16pt
        break;
      case HeadingLevel.HEADING_2:
        fontSize = 28; // 14pt
        break;
      case HeadingLevel.HEADING_3:
        fontSize = 26; // 13pt
        break;
      case HeadingLevel.HEADING_4:
        fontSize = 24; // 12pt
        break;
      case HeadingLevel.HEADING_5:
        fontSize = 22; // 11pt
        break;
      case HeadingLevel.HEADING_6:
        fontSize = 20; // 10pt
        break;
      case HeadingLevel.TITLE:
        fontSize = 36; // 18pt
        break;
    }

    return new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          size: fontSize,
          color: '2c3e50',
        }),
      ],
      heading: level,
      spacing: {
        before: level === HeadingLevel.HEADING_1 ? 400 : 300,
        after: 200,
      },
    });
  }

  private createParagraph(element: Element): Paragraph {
    const textRuns: TextRun[] = [];
    
    // Process formatted text content
    this.processInlineElements(element, textRuns);
    
    if (textRuns.length === 0) {
      // Fallback to plain text
      textRuns.push(new TextRun({
        text: element.textContent || '',
      }));
    }

    return new Paragraph({
      children: textRuns,
      spacing: {
        after: 200,
      },
    });
  }

  private processInlineElements(element: Element, textRuns: TextRun[]): void {
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text?.trim()) {
          textRuns.push(new TextRun({ text }));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const text = el.textContent || '';
        
        if (!text.trim()) continue;

        let textRun: TextRun;
        
        switch (el.tagName.toLowerCase()) {
          case 'strong':
          case 'b':
            textRun = new TextRun({ text, bold: true });
            break;
          case 'em':
          case 'i':
            textRun = new TextRun({ text, italics: true });
            break;
          case 'u':
            textRun = new TextRun({ text, underline: {} });
            break;
          case 's':
          case 'strike':
            textRun = new TextRun({ text, strike: true });
            break;
          case 'code':
            textRun = new TextRun({ 
              text, 
              font: 'Courier New',
              size: 18, // 9pt
              shading: {
                fill: 'f4f4f4',
              },
            });
            break;
          case 'a':
            textRun = new TextRun({ 
              text, 
              color: '0066cc',
              underline: {},
            });
            break;
          default:
            textRun = new TextRun({ text });
            break;
        }
        
        textRuns.push(textRun);
      }
    }
  }

  private createList(listElement: Element): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const isOrdered = listElement.tagName.toLowerCase() === 'ol';
    
    Array.from(listElement.children).forEach((li, index) => {
      if (li.tagName.toLowerCase() === 'li') {
        const bulletText = isOrdered ? `${index + 1}.` : '•';
        const textContent = li.textContent || '';
        
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: `${bulletText} ${textContent}`,
            }),
          ],
          spacing: {
            after: 100,
          },
          indent: {
            left: 720, // 0.5 inch
          },
        }));
      }
    });
    
    return paragraphs;
  }

  private createBlockquote(text: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          italics: true,
          color: '666666',
        }),
      ],
      spacing: {
        before: 200,
        after: 200,
      },
      indent: {
        left: 720, // 0.5 inch
      },
      border: {
        left: {
          color: '007bff',
          size: 6,
          style: 'single',
        },
      },
    });
  }

  private createCodeBlock(text: string): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          font: 'Courier New',
          size: 18, // 9pt
        }),
      ],
      spacing: {
        before: 200,
        after: 200,
      },
      shading: {
        fill: 'f4f4f4',
      },
    });
  }

  private createTable(tableElement: HTMLTableElement): Table {
    const rows: TableRow[] = [];
    
    Array.from(tableElement.rows).forEach((row, rowIndex) => {
      const cells: TableCell[] = [];
      
      Array.from(row.cells).forEach(cell => {
        const isHeader = rowIndex === 0 || cell.tagName.toLowerCase() === 'th';
        
        cells.push(new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cell.textContent || '',
                  bold: isHeader,
                }),
              ],
            }),
          ],
          shading: isHeader ? { fill: 'f8f9fa' } : undefined,
        }));
      });
      
      rows.push(new TableRow({ children: cells }));
    });
    
    return new Table({
      rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    });
  }

  private createHorizontalRule(): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: '',
        }),
      ],
      spacing: {
        before: 200,
        after: 200,
      },
      border: {
        bottom: {
          color: 'e9ecef',
          size: 6,
          style: 'single',
        },
      },
    });
  }
} 