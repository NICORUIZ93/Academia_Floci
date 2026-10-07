from pathlib import Path
import math
import html
import numpy as np
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Flowable, Table, TableStyle, Image, KeepTogether, Preformatted

ROOT = Path('/Users/nicolasruiz/Documents/GitHub/Academia_Floci')
OUT = ROOT / 'output/pdf/taller_logica_difusa'
PDF = OUT / 'Taller_Logica_Difusa_Solucion.pdf'
IMG = OUT / 'imagenes'

pdfmetrics.registerFont(TTFont('ArialU', '/System/Library/Fonts/Supplemental/Arial Unicode.ttf'))
pdfmetrics.registerFont(TTFont('ArialB', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'))

NAVY = colors.HexColor('#17364D')
BLUE = colors.HexColor('#1769E0')
ORANGE = colors.HexColor('#D96C17')
GRAY = colors.HexColor('#A9B5BF')
LIGHT = colors.HexColor('#F4F7FA')
GREEN = colors.HexColor('#188A62')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='Title2', fontName='ArialB', fontSize=23, leading=28,
                          textColor=NAVY, alignment=1, spaceAfter=10))
styles.add(ParagraphStyle(name='Sub2', fontName='ArialU', fontSize=11, leading=15,
                          textColor=colors.HexColor('#526878'), alignment=1, spaceAfter=12))
styles.add(ParagraphStyle(name='H1x', fontName='ArialB', fontSize=16, leading=20,
                          textColor=NAVY, spaceBefore=4, spaceAfter=7))
styles.add(ParagraphStyle(name='H2x', fontName='ArialB', fontSize=12, leading=15,
                          textColor=BLUE, spaceBefore=5, spaceAfter=4))
styles.add(ParagraphStyle(name='Bx', fontName='ArialU', fontSize=10, leading=14,
                          textColor=colors.HexColor('#263A49'), spaceAfter=6))
styles.add(ParagraphStyle(name='Note', fontName='ArialU', fontSize=9.5, leading=13,
                          textColor=NAVY, backColor=colors.HexColor('#EAF2FF'),
                          borderColor=BLUE, borderWidth=1, borderPadding=7, spaceAfter=7))
styles.add(ParagraphStyle(name='Step', fontName='ArialU', fontSize=10.2, leading=14,
                          textColor=colors.HexColor('#263A49'), backColor=colors.white,
                          borderColor=colors.HexColor('#C9D7E2'), borderWidth=.7,
                          borderPadding=7, spaceAfter=6))
styles.add(ParagraphStyle(name='CodeX', fontName='Courier', fontSize=6.6, leading=8.2,
                          textColor=colors.HexColor('#172B3A'), backColor=LIGHT,
                          borderColor=GRAY, borderWidth=.5, borderPadding=7))


def P(text, style='Bx'):
    return Paragraph(text, styles[style])


def example_at_15(operation_text):
    """Tabla autocontenida: muestra de dónde salen a y b antes de operar."""
    rows=[
        ['Paso','Explicación completa en x = 1.5'],
        ['1',P('Ubicamos 1.5: está entre 1 y 2. En A corresponde al tramo que baja; en B corresponde al tramo que sube.','Bx')],
        ['2',P('Para A, cuando 1 &lt; x &lt; 2 se usa μA(x)=2-x. Entonces μA(1.5)=2-1.5=<b>0.50</b>.','Bx')],
        ['3',P('Para B, cuando 1 &lt; x &lt; 3 se usa μB(x)=(x-1)/2. Entonces μB(1.5)=(1.5-1)/2=0.5/2=<b>0.25</b>.','Bx')],
        ['4',P('Para escribir menos, llamamos <b>a=μA(1.5)=0.50</b> y <b>b=μB(1.5)=0.25</b>. Las letras a y b no son datos nuevos: son abreviaciones de esas dos alturas.','Bx')],
        ['5',P(operation_text,'Bx')],
    ]
    t=Table(rows,colWidths=[1.25*cm,14.55*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('FONTNAME',(0,0),(-1,0),'ArialB'),('FONTNAME',(0,1),(-1,-1),'ArialU'),
        ('FONTSIZE',(0,0),(-1,-1),8.5),('GRID',(0,0),(-1,-1),.4,GRAY),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),
        ('ALIGN',(0,1),(0,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),
    ]))
    return t


class MathLine(Flowable):
    def __init__(self, text, height=34, size=15):
        super().__init__(); self.text=text; self.height=height; self.size=size
    def wrap(self, aw, ah): self._availWidth=aw; return aw, self.height
    def draw(self):
        c=self.canv; w=self._availWidth
        c.setFillColor(LIGHT); c.roundRect(0,2,w,self.height-4,7,fill=1,stroke=0)
        c.setFont('ArialU',self.size); c.setFillColor(NAVY)
        c.drawCentredString(w/2,self.height/2-5,self.text)


class Piecewise(Flowable):
    def __init__(self, lhs, rows, caption=None):
        super().__init__(); self.lhs=lhs; self.rows=rows; self.caption=caption
        self.height=42+29*len(rows)+(18 if caption else 0)
    def wrap(self, aw, ah): self._availWidth=aw; return aw,self.height
    def draw_expr(self,c,expr,x,y):
        c.setFont('ArialU',13); c.setFillColor(NAVY)
        if isinstance(expr,tuple) and expr[0]=='frac':
            num,den=expr[1],expr[2]
            width=max(c.stringWidth(num,'ArialU',12),c.stringWidth(den,'ArialU',12))+12
            c.setFont('ArialU',12); c.drawCentredString(x+width/2,y+5,num)
            c.line(x,y+2,x+width,y+2); c.drawCentredString(x+width/2,y-11,den)
        else: c.drawString(x,y-2,expr)
    def draw(self):
        c=self.canv; w=self._availWidth
        c.setFillColor(LIGHT); c.roundRect(0,1,w,self.height-2,8,fill=1,stroke=0)
        c.setFillColor(NAVY); c.setFont('ArialU',15)
        base=self.height-42; c.drawString(18,base-(len(self.rows)-1)*14,self.lhs+' =')
        xbrace=125; top=self.height-25; bot=self.height-25-29*len(self.rows)+10
        p=c.beginPath(); p.moveTo(xbrace+12,top); p.curveTo(xbrace,top,xbrace,top-10,xbrace,top-18)
        p.lineTo(xbrace,(top+bot)/2+8); p.curveTo(xbrace,(top+bot)/2+3,xbrace-9,(top+bot)/2,xbrace-9,(top+bot)/2)
        p.curveTo(xbrace-9,(top+bot)/2,xbrace,(top+bot)/2-3,xbrace,(top+bot)/2-8)
        p.lineTo(xbrace,bot+18); p.curveTo(xbrace,bot+10,xbrace,bot,xbrace+12,bot)
        c.setStrokeColor(NAVY); c.setLineWidth(1.7); c.drawPath(p)
        y=top-14
        for expr,cond in self.rows:
            self.draw_expr(c,expr,150,y)
            c.setFont('ArialU',11); c.setFillColor(colors.HexColor('#42596A')); c.drawString(330,y-2,cond)
            y-=29
        if self.caption:
            c.setFont('ArialU',8.5); c.setFillColor(colors.HexColor('#607586')); c.drawString(18,8,self.caption)


class FuzzyGraph(Flowable):
    def __init__(self, title, result_fn=None, show_originals=True, points=None, shade=False, instruction=''):
        super().__init__(); self.title=title; self.result_fn=result_fn; self.show_originals=show_originals
        self.points=points or []; self.shade=shade; self.instruction=instruction; self.height=255
    def wrap(self,aw,ah): self._availWidth=aw; return aw,self.height
    def draw_curve(self,c,fn,color,width=2,dash=None):
        X=np.linspace(0,5,301); pts=[]
        for x in X:
            y=float(fn(x)); pts.append((55+(self._availWidth-85)*x/5,42+155*y))
        p=c.beginPath(); p.moveTo(*pts[0])
        for q in pts[1:]: p.lineTo(*q)
        c.setStrokeColor(color); c.setLineWidth(width); c.setDash(dash or [])
        c.drawPath(p); c.setDash([])
    def draw(self):
        c=self.canv; w=self._availWidth
        c.setFont('ArialB',11); c.setFillColor(NAVY); c.drawString(8,232,self.title)
        x0,y0=55,42; gw=w-85; gh=155
        c.setStrokeColor(colors.HexColor('#E0E7ED')); c.setLineWidth(.6)
        for i in range(6):
            xx=x0+gw*i/5; c.line(xx,y0,xx,y0+gh)
        for j in range(6):
            yy=y0+gh*j/5; c.line(x0,yy,x0+gw,yy)
        c.setStrokeColor(NAVY); c.setLineWidth(1.5); c.line(x0,y0,x0+gw+8,y0); c.line(x0,y0,x0,y0+gh+8)
        c.setFont('ArialU',8); c.setFillColor(NAVY)
        for i in range(6): c.drawCentredString(x0+gw*i/5,y0-14,str(i))
        for j in range(6): c.drawRightString(x0-7,y0+gh*j/5-3,f'{j/5:.1f}')
        c.drawString(x0+gw+12,y0-3,'x'); c.drawString(14,y0+gh+4,'μ(x)')
        A=lambda x:max(min(x,2-x),0); B=lambda x:max(min((x-1)/2,1,5-x),0)
        if self.show_originals:
            self.draw_curve(c,A,GRAY,1.2,[4,3]); self.draw_curve(c,B,GRAY,1.2,[4,3])
            c.setFont('ArialU',8); c.setFillColor(GRAY); c.drawString(x0+gw*.12,y0+gh*.72,'A'); c.drawString(x0+gw*.66,y0+gh*.9,'B')
        if self.result_fn: self.draw_curve(c,self.result_fn,BLUE,3)
        else:
            self.draw_curve(c,A,BLUE,3); self.draw_curve(c,B,ORANGE,3)
        for xv,yv,label in self.points:
            xx=x0+gw*xv/5; yy=y0+gh*yv
            c.setFillColor(GREEN); c.circle(xx,yy,3,fill=1,stroke=0); c.setFont('ArialU',8); c.drawString(xx+5,yy+5,label)
        if self.instruction:
            c.setFillColor(colors.HexColor('#506575')); c.setFont('ArialU',8.5); c.drawString(8,12,'Para dibujar: '+self.instruction)


def muA(x): return max(min(x,2-x),0)
def muB(x): return max(min((x-1)/2,1,5-x),0)
def footer(c,doc):
    c.saveState(); c.setFont('ArialU',8); c.setFillColor(colors.HexColor('#687C8B'))
    c.line(1.6*cm,1.25*cm,20*cm,1.25*cm); c.drawString(1.6*cm,.82*cm,'Guia para copiar a mano')
    c.drawRightString(20*cm,.82*cm,f'Página {doc.page}'); c.restoreState()


def build():
    doc=SimpleDocTemplate(str(PDF),pagesize=letter,leftMargin=1.55*cm,rightMargin=1.55*cm,
                          topMargin=1.35*cm,bottomMargin=1.55*cm,title='Taller de lógica difusa - guía manuscrita')
    S=[]
    S += [Spacer(1,.5*cm),P('Solución del taller de lógica difusa','Title2'),
          P('Ordenada como se debe desarrollar y escrita para copiar a mano','Sub2')]
    S += [P('<b>Ruta de trabajo:</b> 1) leer A y B; 2) escribir sus funciones; 3) hallar el cruce; 4) resolver las tres uniones; 5) resolver las tres intersecciones; 6) resolver las negaciones; 7) comprobar con números.','Note')]
    S += [P('<b>Datos visibles usados:</b> A = triangular (0,1,2), B = trapezoidal (1,3,4,5) y universo U = [0,5].','Step')]
    S += [P('<b>Supuesto que NO aparece claramente:</b> el valor de w para Yager. La respuesta correcta se deja con w. Solo se dibuja w=2 como ejemplo y debe confirmarse con el profesor.','Step')]
    S += [P('<b>Idea sencilla:</b> μA(x) y μB(x) son solamente las alturas de las dos figuras en el punto x. Para cada operación se calculan esas dos alturas y se aplica la regla indicada.','Step')]
    S += [P('Signos que vas a encontrar','H2x')]
    quick=[['Símbolo','Lectura sencilla'],['μA(x)','altura de A en x'],['μB(x)','altura de B en x'],['S','unión: A o B'],['T','intersección: A y B'],['N','negación: no A'],['max','escoger el mayor'],['min','escoger el menor'],['≤','menor o igual'],['≥','mayor o igual']]
    qt=Table(quick,colWidths=[4*cm,11.5*cm])
    qt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'ArialB'),('FONTNAME',(0,1),(-1,-1),'ArialU'),('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),.4,GRAY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    S += [qt,PageBreak()]

    S += [P('Paso 1. Construir A y B','H1x')]
    S += [P('Usa una cuadrícula. Marca los números 0, 1, 2, 3, 4 y 5 sobre el eje x; marca de 0 a 1 sobre el eje vertical. Une los puntos indicados con regla.','Bx')]
    S += [FuzzyGraph('Gráfica base que debe parecerse a la fotografía',None,False,
                     [(0,0,'0'),(1,1,'(1,1)'),(2,0,'2'),(3,1,'(3,1)'),(4,1,'(4,1)'),(5,0,'5')],
                     instruction='A: (0,0)→(1,1)→(2,0).  B: (1,0)→(3,1)→(4,1)→(5,0).')]
    S += [P('<b>Muy importante:</b> la fotografía solo dibuja A, B y la zona donde se superponen. No dibuja las seis operaciones terminadas. Por eso las gráficas de SZ, Sprob, SL, TZ, TA y TL no tienen que verse iguales al boceto de la foto; cada una es un resultado diferente calculado a partir de estas dos figuras.','Note')]
    S += [P('Función triangular A','H2x'),Piecewise('μA(x)',[
        ('0','x ≤ 0'),('x','0 < x ≤ 1'),('2 − x','1 < x < 2'),('0','x ≥ 2')])]
    S += [KeepTogether([P('Función trapezoidal B','H2x'),Piecewise('μB(x)',[
        ('0','x ≤ 1'),(('frac','x − 1','2'),'1 < x < 3'),('1','3 ≤ x ≤ 4'),('5 − x','4 < x < 5'),('0','x ≥ 5')])])]

    S += [P('Paso 2. Entender dónde se cruzan A y B','H1x')]
    S += [P('<b>¿Qué significa que se cruzan?</b> Significa que, en una misma posición x, las dos líneas tienen exactamente la misma altura. En símbolos: μA(x) = μB(x).','Step')]
    S += [P('<b>¿Dónde debo buscar?</b> A existe entre x=0 y x=2. B empieza en x=1. Por eso ambas líneas solo están juntas entre x=1 y x=2. Fuera de ese intervalo no pueden cruzarse con altura positiva.','Step')]
    S += [P('Antes del cruce: ejemplo en x=1.5','H2x')]
    before=[['Pregunta','Cálculo','Respuesta'],['Altura de A','μA(1.5) = 2 - 1.5','0.50'],['Altura de B','μB(1.5) = (1.5 - 1)/2','0.25'],['¿Cuál está arriba?','0.50 > 0.25','A está arriba']]
    bt=Table(before,colWidths=[4.2*cm,7.3*cm,4.2*cm])
    bt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'ArialB'),('FONTNAME',(0,1),(-1,-1),'ArialU'),('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),.4,GRAY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    S += [bt,P('Al avanzar hacia x=2, A continúa bajando y B continúa subiendo. En algún momento quedan a la misma altura: ese es el cruce.','Note'),PageBreak()]

    S += [P('Paso 2.1. Calcular el cruce sin saltarse pasos','H1x')]
    S += [P('<b>En el intervalo 1 < x < 2:</b> la altura de A es 2 - x y la altura de B es (x - 1)/2. Para que sean iguales, se igualan estas dos expresiones.','Step')]
    S += [MathLine('altura de A = altura de B',34,15),MathLine('2 − x  =  (x − 1) / 2',38,17)]
    S += [P('<b>Paso A:</b> multiplicamos ambos lados por 2 para quitar el denominador.','Step'),MathLine('2(2 − x) = x − 1    ⇒    4 − 2x = x − 1',38,15)]
    S += [P('<b>Paso B:</b> llevamos los números a la izquierda y las x a la derecha.','Step'),MathLine('4 + 1 = x + 2x    ⇒    5 = 3x',38,15)]
    S += [P('<b>Paso C:</b> dividimos ambos lados entre 3.','Step'),MathLine('x = 5/3 ≈ 1.67',38,17)]
    S += [P('<b>Paso D:</b> hallamos la altura sustituyendo x=5/3 en cualquiera de las dos funciones.','Step'),MathLine('μA(5/3) = 2 − 5/3 = 1/3 ≈ 0.33',38,15),MathLine('μB(5/3) = (5/3 − 1)/2 = 1/3 ≈ 0.33',38,15)]
    S += [P('<b>Resultado:</b> las líneas se cruzan en el punto (5/3, 1/3), aproximadamente (1.67, 0.33). El primer número es la posición horizontal; el segundo es la altura.','Note'),PageBreak()]

    S += [P('Paso 2.2. Ver el cruce en la gráfica','H1x')]
    S += [FuzzyGraph('El punto verde es donde las dos alturas son iguales',None,False,[(5/3,1/3,'cruce = (1.67,0.33)')],instruction='desde x=1.67 sube hasta y=0.33; allí se encuentran las dos líneas.')]
    crosscheck=[['Posición','μA(x)','μB(x)','Qué ocurre'],['x = 1.50','0.50','0.25','A está arriba'],['x = 1.67 aprox.','0.33','0.33','se cruzan'],['x = 1.80','0.20','0.40','B está arriba']]
    xt=Table(crosscheck,colWidths=[3.5*cm,3.2*cm,3.2*cm,5.8*cm])
    xt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'ArialB'),('FONTNAME',(0,1),(-1,-1),'ArialU'),('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),.4,GRAY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('ALIGN',(1,1),(2,-1),'CENTER'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    S += [xt,P('<b>¿Para qué sirve el cruce?</b> En la unión de Zadeh escogemos la línea más alta y en la intersección de Zadeh escogemos la más baja. Por eso necesitamos saber exactamente dónde A deja de estar arriba y B pasa a estar arriba.','Note'),PageBreak()]

    S += [P('Cómo resolver cualquier operación','H1x')]
    recipe=[['Paso','Qué debes hacer'],['1','Elige una posición x.'],['2','Busca la altura de A: a = μA(x).'],['3','Busca la altura de B: b = μB(x).'],['4','Sustituye a y b en la fórmula del operador.'],['5','El número obtenido es la altura de la nueva gráfica en esa x.'],['6','Repite para las posiciones necesarias y une los puntos.']]
    rt=Table(recipe,colWidths=[2.2*cm,13.6*cm])
    rt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'ArialB'),('FONTNAME',(0,1),(-1,-1),'ArialU'),('FONTSIZE',(0,0),(-1,-1),10),('GRID',(0,0),(-1,-1),.4,GRAY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('ALIGN',(0,1),(0,-1),'CENTER'),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
    S += [rt,Spacer(1,.3*cm),P('<b>No confundas:</b> “unión” no siempre significa dibujar simplemente el contorno exterior, e “intersección” no siempre significa sombrear la zona común. Eso solo describe Zadeh (máximo y mínimo). Los demás operadores usan fórmulas distintas y producen curvas diferentes.','Note'),PageBreak()]

    unions=[
        ('Paso 3.1. Unión de Zadeh SZ','SZ(a,b) = max(a,b)',lambda x:max(muA(x),muB(x)),
         Piecewise('SZ(x)',[('0','x ≤ 0'),('x','0 < x ≤ 1'),('2 − x','1 < x ≤ 5/3'),(('frac','x − 1','2'),'5/3 < x < 3'),('1','3 ≤ x ≤ 4'),('5 − x','4 < x < 5'),('0','x ≥ 5')]),
         'sigue la línea más alta entre A y B.'),
        ('Paso 3.2. Unión probabilística Sprob','Sprob(a,b) = a + b − ab',lambda x:muA(x)+muB(x)-muA(x)*muB(x),
         Piecewise('Sprob(x)',[('0','x ≤ 0'),('x','0 < x ≤ 1'),(('frac','x² − 4x + 5','2'),'1 < x < 2'),(('frac','x − 1','2'),'2 ≤ x < 3'),('1','3 ≤ x ≤ 4'),('5 − x','4 < x < 5'),('0','x ≥ 5')]),
         'fuera de 1<x<2 coincide con la curva no nula; en el cruce queda por encima de ambas.'),
        ('Paso 3.3. Unión de Łukasiewicz SL','SL(a,b) = min(1, a + b)',lambda x:min(1,muA(x)+muB(x)),
         Piecewise('SL(x)',[('0','x ≤ 0'),('x','0 < x ≤ 1'),(('frac','3 − x','2'),'1 < x < 2'),(('frac','x − 1','2'),'2 ≤ x < 3'),('1','3 ≤ x ≤ 4'),('5 − x','4 < x < 5'),('0','x ≥ 5')]),
         'en 1<x<2 une (1,1) con (2,0.5) mediante una recta.')]
    union_examples={
        'Zadeh':'Ahora aplicamos Zadeh: SZ=max(a,b)=max(0.50,0.25)=<b>0.50</b>. Se escoge 0.50 porque es la altura mayor.',
        'probabilística':'Ahora aplicamos la suma probabilística: Sprob=a+b-ab=0.50+0.25-(0.50)(0.25)=0.75-0.125=<b>0.625</b>.',
        'Łukasiewicz':'Ahora aplicamos Łukasiewicz: SL=min(1,a+b)=min(1,0.50+0.25)=min(1,0.75)=<b>0.75</b>.'}
    for title,formula,fn,pw,inst in unions:
        key='probabilística' if 'probabilística' in title else ('Łukasiewicz' if 'Łukasiewicz' in title else 'Zadeh')
        S += [P(title,'H1x'),P('<b>Regla general:</b> primero calculo las dos alturas. Después aplico esta fórmula:','Step'),MathLine(formula),P('Ejemplo completo: de dónde salen 0.50 y 0.25','H2x'),example_at_15(union_examples[key]),P('<b>Cómo dibujo el resultado:</b> '+html.escape(inst),'Step'),FuzzyGraph(title,fn,True,instruction=inst),KeepTogether([P('<b>Resultado final por tramos:</b>','H2x'),pw]),PageBreak()]

    intersections=[
        ('Paso 4.1. Intersección de Zadeh TZ','TZ(a,b) = min(a,b)',lambda x:min(muA(x),muB(x)),
         Piecewise('TZ(x)',[('0','x ≤ 1'),(('frac','x − 1','2'),'1 < x ≤ 5/3'),('2 − x','5/3 < x < 2'),('0','x ≥ 2')]),
         'en el solapamiento sigue la línea más baja; fuera de él va sobre el eje x.'),
        ('Paso 4.2. Intersección algebraica TA','TA(a,b) = ab',lambda x:muA(x)*muB(x),
         Piecewise('TA(x)',[(('frac','−x² + 3x − 2','2'),'1 < x < 2'),('0','en otro caso')]),
         'dibuja una pequeña curva bajo TZ entre x=1 y x=2; fuera vale cero.'),
        ('Paso 4.3. Intersección de Łukasiewicz TL','TL(a,b) = max(0, a + b − 1)',lambda x:max(0,muA(x)+muB(x)-1),
         Piecewise('TL(x)',[('0','para todo x')]),
         'traza solamente el eje horizontal y=0; A(x)+B(x) nunca supera 1.')]
    intersection_examples={
        'Zadeh':'Ahora aplicamos Zadeh: TZ=min(a,b)=min(0.50,0.25)=<b>0.25</b>. Se escoge 0.25 porque es la altura menor.',
        'algebraica':'Ahora aplicamos el producto: TA=ab=(0.50)(0.25)=<b>0.125</b>.',
        'Łukasiewicz':'Ahora aplicamos Łukasiewicz: TL=max(0,a+b-1)=max(0,0.50+0.25-1)=max(0,-0.25)=<b>0</b>. No se permiten alturas negativas.'}
    for title,formula,fn,pw,inst in intersections:
        key='algebraica' if 'algebraica' in title else ('Łukasiewicz' if 'Łukasiewicz' in title else 'Zadeh')
        S += [P(title,'H1x'),P('<b>Regla general:</b> primero calculo las dos alturas. Después aplico esta fórmula:','Step'),MathLine(formula),P('Ejemplo completo: de dónde salen 0.50 y 0.25','H2x'),example_at_15(intersection_examples[key]),P('<b>Cómo dibujo el resultado:</b> '+html.escape(inst),'Step'),FuzzyGraph(title,fn,True,instruction=inst),KeepTogether([P('<b>Resultado final por tramos:</b>','H2x'),pw])]
        if 'Łukasiewicz' in title: S += [P('Que toda la intersección sea cero es un resultado válido, no una gráfica faltante.','Note')]
        S += [PageBreak()]

    S += [P('Paso 5. Entender las negaciones','H1x'),P('<b>Negar A significa preguntar “qué tanto NO pertenece a A”.</b> Si A vale 1, su negación vale 0. Si A vale 0, su negación vale 1. Si A vale 0.5, la negación de Zadeh también vale 0.5.','Step')]
    negdemo=[['x','μA(x)','NZ(A)=1-μA(x)','Lectura'],['0','0','1','no pertenece a A'],['0.5','0.5','0.5','pertenencia intermedia'],['1','1','0','pertenece totalmente a A'],['1.5','0.5','0.5','pertenencia intermedia'],['2','0','1','no pertenece a A']]
    nt=Table(negdemo,colWidths=[2.1*cm,3.2*cm,4.2*cm,6.2*cm])
    nt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'ArialB'),('FONTNAME',(0,1),(-1,-1),'ArialU'),('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),.4,GRAY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('ALIGN',(0,1),(2,-1),'CENTER'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    S += [nt,P('La fotografía parece pedir N(μA(x)); por eso se desarrolla A. B solo se incluye después como información adicional para confirmar con el profesor.','Note')]
    S += [P('Negación de Zadeh','H2x'),MathLine('NZ(a) = 1 − a')]
    S += [Piecewise('NZ(A)(x)',[('1','x ≤ 0'),('1 − x','0 < x ≤ 1'),('x − 1','1 < x < 2'),('1','x ≥ 2')])]
    S += [FuzzyGraph('Negación estándar de A',lambda x:1-muA(x),True,instruction='empieza en 1, baja a 0 en x=1, sube a 1 en x=2 y permanece en 1.')]
    S += [P('Negación de Yager','H2x'),P('Hace la misma idea de “no A”, pero cambia la forma de la curva usando un número w. Como la foto no da ese número, no existe una sola gráfica de Yager determinada por el enunciado.','Step'),MathLine('NY,w(a) = (1 − aʷ)¹⁄ʷ     con w > 0')]
    S += [Piecewise('NY,w(A)(x)',[('1','x ≤ 0'),('(1 − xʷ)¹⁄ʷ','0 < x ≤ 1'),('(1 − (2−x)ʷ)¹⁄ʷ','1 < x < 2'),('1','x ≥ 2')],caption='Para una gráfica concreta se usa w=2 como supuesto, porque el enunciado no muestra w.')]
    S += [FuzzyGraph('Ejemplo de Yager con w=2',lambda x:math.sqrt(max(0,1-muA(x)**2)),True,instruction='es curva: pasa por (0,1), (1,0), (2,1) y luego queda en 1.'),PageBreak()]

    S += [P('Si el profesor también pide negar B','H1x'),P('Esto no se distingue con seguridad en la fotografía. Se incluye para que la solución quede completa, pero debe confirmarse.','Note')]
    S += [Piecewise('NZ(B)(x)',[('1','x ≤ 1'),(('frac','3 − x','2'),'1 < x < 3'),('0','3 ≤ x ≤ 4'),('x − 4','4 < x < 5'),('1','x ≥ 5')])]
    S += [Piecewise('NY,w(B)(x)',[('1','x ≤ 1'),('(1 − ((x−1)/2)ʷ)¹⁄ʷ','1 < x < 3'),('0','3 ≤ x ≤ 4'),('(1 − (5−x)ʷ)¹⁄ʷ','4 < x < 5'),('1','x ≥ 5')],caption='Yager continúa dependiendo de w; no se puede fijar sin un dato adicional.'),PageBreak()]

    S += [P('Paso 6. Comprobación numérica en x=1.5','H1x')]
    rows=[['Paso','Sustitución','Resultado'],['μA','2 − 1.5','0.500'],['μB','(1.5 − 1)/2','0.250'],
          ['SZ','max(0.5,0.25)','0.500'],['Sprob','0.5+0.25−(0.5)(0.25)','0.625'],['SL','min(1,0.75)','0.750'],
          ['TZ','min(0.5,0.25)','0.250'],['TA','(0.5)(0.25)','0.125'],['TL','max(0,−0.25)','0.000'],
          ['NZ(A)','1−0.5','0.500'],['NY,2(A)','√(1−0.5²)','0.866']]
    t=Table(rows,colWidths=[3*cm,9.4*cm,3.3*cm],repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),
                           ('FONTNAME',(0,0),(-1,0),'ArialB'),('FONTNAME',(0,1),(-1,-1),'ArialU'),
                           ('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),.4,GRAY),
                           ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    S += [t,Spacer(1,.3*cm),P('<b>Conclusión:</b> todos los valores propuestos para x=1.5 son correctos. No se encontró error en SZ, Sprob, SL, TZ, TA ni TL.','Note'),PageBreak()]

    S += [P('Paso 7. Tabla discreta de x = 0 a 5','H1x'),P('Cada fila repite el mismo procedimiento: primero se calculan A y B; luego se aplican las seis reglas.','Bx')]
    table_rows=[['x','A','B','SZ','Sprob','SL','TZ','TA','TL','NZ(A)','NY2(A)']]
    for x in np.arange(0,5.01,.5):
        a,b=muA(x),muB(x)
        vals=[x,a,b,max(a,b),a+b-a*b,min(1,a+b),min(a,b),a*b,max(0,a+b-1),1-a,math.sqrt(max(0,1-a*a))]
        table_rows.append([f'{vals[0]:.1f}']+[f'{v:.3f}' for v in vals[1:]])
    dt=Table(table_rows,colWidths=[1.05*cm]+[1.45*cm]*10,repeatRows=1)
    dt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'ArialB'),('FONTNAME',(0,1),(-1,-1),'ArialU'),('FONTSIZE',(0,0),(-1,-1),6.7),('GRID',(0,0),(-1,-1),.35,GRAY),('ALIGN',(0,0),(-1,-1),'CENTER'),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    S += [dt,P('NY2(A) significa negación de Yager de A usando w=2 únicamente como ejemplo.','Note'),PageBreak()]

    pycode="""import numpy as np
import matplotlib.pyplot as plt

x = np.arange(0, 5.01, 0.5)
A = np.maximum(np.minimum(x, 2-x), 0)
B = np.maximum(np.minimum.reduce([(x-1)/2, np.ones_like(x), 5-x]), 0)

SZ    = np.maximum(A, B)
Sprob = A + B - A*B
SL    = np.minimum(1, A+B)
TZ    = np.minimum(A, B)
TA    = A*B
TL    = np.maximum(0, A+B-1)
NZ_A  = 1-A
w = 2  # SOLO EJEMPLO; confirmar con el profesor
NY_A  = (1-A**w)**(1/w)

for nombre, y in [('A',A),('B',B),('SZ',SZ),('Sprob',Sprob),
                  ('SL',SL),('TZ',TZ),('TA',TA),('TL',TL),
                  ('NZ_A',NZ_A),('NY_A',NY_A)]:
    plt.figure(); plt.plot(x, y, 'o-'); plt.grid(True)
    plt.title(nombre); plt.xlabel('x'); plt.ylabel('pertenencia')
    plt.ylim(-0.05,1.05)
plt.show()"""
    S += [P('Anexo 1. Código completo en Python','H1x'),P('Copia y ejecuta este bloque. Produce los valores discretos y una gráfica separada para cada resultado.','Bx'),Preformatted(pycode,styles['CodeX']),PageBreak()]

    matcode="""x = 0:0.5:5;
A = max(min(x, 2-x), 0);
B = max(min([ (x-1)/2; ones(size(x)); 5-x ],[],1), 0);
SZ = max(A,B);  Sprob = A+B-A.*B;  SL = min(1,A+B);
TZ = min(A,B);  TA = A.*B;       TL = max(0,A+B-1);
NZ_A = 1-A;
w = 2; % SOLO EJEMPLO: confirmar con el profesor
NY_A = (1-A.^w).^(1/w);

nombres = {'A','B','SZ','Sprob','SL','TZ','TA','TL','NZ_A','NY_A'};
Y = {A,B,SZ,Sprob,SL,TZ,TA,TL,NZ_A,NY_A};
for k = 1:length(Y)
    figure; plot(x,Y{k},'o-','LineWidth',1.5); grid on;
    title(nombres{k}); xlabel('x'); ylabel('pertenencia'); ylim([-0.05 1.05]);
end"""
    S += [P('Anexo 2. Código completo en MATLAB','H1x'),P('Este bloque hace el mismo cálculo que Python. El punto antes de * y ^ indica operación elemento por elemento.','Bx'),Preformatted(matcode,styles['CodeX']),PageBreak()]

    S += [P('Anexo 3. Fotografías y lectura del enunciado','H1x'),P('Estas páginas se dejan al final para que puedas comparar la solución con la hoja sin interrumpir el desarrollo matemático.','Bx')]
    faithful=Image(str(IMG/'07_copia_limpia_fiel_del_enunciado.png'),width=13.8*cm,height=20.7*cm); faithful.hAlign='CENTER'
    S += [faithful,PageBreak(),P('Gráfica corregida según los parámetros escritos','H1x')]
    S += [P('<b>Corrección importante:</b> en una versión anterior la línea naranja de B aparecía comenzando en x=2. Eso era incorrecto. Como B=(1,3,4,5), B debe comenzar exactamente en (1,0), subir hasta (3,1), permanecer plana hasta (4,1) y bajar hasta (5,0).','Note')]
    S += [FuzzyGraph('Reproducción geométrica correcta de A y B',None,False,
                     [(0,0,'A: (0,0)'),(1,1,'A: (1,1)'),(2,0,'A: (2,0)'),
                      (1,0,'B: (1,0)'),(3,1,'B: (3,1)'),(4,1,'B: (4,1)'),(5,0,'B: (5,0)'),
                      (5/3,1/3,'cruce (5/3,1/3)')],
                     instruction='A: 0→1→2. B: 1→3→4→5. El cruce exacto está en x=5/3≈1.67.')]
    S += [P('<b>Por qué el dibujo de la fotografía puede verse diferente:</b> está hecho a mano y es aproximado. Los puntos escritos (0,1,2) y (1,3,4,5) determinan las posiciones exactas. La zona rayada de la fotografía solo señala el solapamiento entre x=1 y x=2; no es una nueva función.','Step')]
    compare=[['Figura','Puntos exactos que se deben unir'],['A triangular','(0,0) → (1,1) → (2,0)'],['B trapezoidal','(1,0) → (3,1) → (4,1) → (5,0)'],['Cruce A=B','(5/3,1/3) ≈ (1.67,0.33)']]
    ct=Table(compare,colWidths=[4*cm,11.5*cm])
    ct.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'ArialB'),('FONTNAME',(0,1),(-1,-1),'ArialU'),('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),.4,GRAY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,LIGHT]),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    S += [ct,PageBreak(),P('Fotografía original','H1x')]
    ph=Image(str(IMG/'foto_enunciado.jpg'),width=11.4*cm,height=12.9*cm); ph.hAlign='CENTER'
    S += [ph,P('<b>Datos por confirmar con el profesor:</b> (1) el valor w de Yager; (2) si debe negarse solamente A o también B; (3) la correspondencia exacta de las letras A, B, C, D y E de la segunda fotografía, porque no se distinguen con certeza.','Note')]

    S += [P('Lista final para copiar en el cuaderno','H1x')]
    S += [P('1) Escribe los datos A y B. 2) Dibuja la gráfica base. 3) Copia μA y μB por tramos. 4) Copia el cruce (5/3,1/3). 5) Para cada unión e intersección copia: nombre, regla, gráfica y resultado por tramos. 6) Copia las negaciones. 7) Añade la comprobación en x=1.5. 8) Adjunta la tabla o el código si el profesor lo exige.','Step')]
    S += [P('<b>Antes de entregar:</b> pregunta el valor de w de Yager y confirma si la negación es solo de A.','Note')]
    doc.build(S,onFirstPage=footer,onLaterPages=footer)

if __name__=='__main__': build(); print(PDF)
