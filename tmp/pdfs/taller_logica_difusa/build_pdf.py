from pathlib import Path
import math
import numpy as np
from PIL import Image as PILImage, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
    PageBreak, KeepTogether
)

ROOT = Path('/Users/nicolasruiz/Documents/GitHub/Academia_Floci')
OUT = ROOT / 'output/pdf/taller_logica_difusa'
IMG = OUT / 'imagenes'
PDF = OUT / 'Taller_Logica_Difusa_Solucion.pdf'

BLUE = '#246BFD'
NAVY = '#14324A'
TEAL = '#008C8C'
ORANGE = '#E67E22'
LIGHT = '#F3F7FB'


def mu_a(x):
    x = np.asarray(x, dtype=float)
    return np.maximum(np.minimum(x, 2-x), 0)


def mu_b(x):
    x = np.asarray(x, dtype=float)
    return np.maximum(np.minimum.reduce(((x-1)/2, np.ones_like(x), 5-x)), 0)


def save_plot(path, curves, title, note=None):
    x = np.linspace(0, 5, 1001)
    width, height = 1500, 700
    left, top, right, bottom = 135, 90, 55, 115
    canvas = PILImage.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()

    def px(xv):
        return left + int((width-left-right) * xv / 5)

    def py(yv):
        return top + int((height-top-bottom) * (1.05-yv) / 1.05)

    # Grid and ticks
    for xv in np.arange(0, 5.01, .5):
        xx = px(xv)
        draw.line((xx, top, xx, height-bottom), fill='#E4EAF0', width=1)
        draw.text((xx-10, height-bottom+12), f'{xv:g}', fill='#415466', font=font)
    for yv in np.arange(0, 1.01, .2):
        yy = py(yv)
        draw.line((left, yy, width-right, yy), fill='#E4EAF0', width=1)
        draw.text((left-42, yy-6), f'{yv:.1f}', fill='#415466', font=font)
    draw.line((left, top, left, height-bottom), fill=NAVY, width=3)
    draw.line((left, height-bottom, width-right, height-bottom), fill=NAVY, width=3)

    # Curves, with dashed variants rendered as short segments
    for label, y, color, style in curves:
        pts = [(px(float(xv)), py(float(yv))) for xv, yv in zip(x, y)]
        if style == '-':
            draw.line(pts, fill=color, width=5, joint='curve')
        else:
            step = 18 if style == '--' else 10
            for i in range(0, len(pts)-step, step*2):
                draw.line(pts[i:i+step], fill=color, width=5, joint='curve')

    draw.text((left, 28), title, fill=NAVY, font=font)
    draw.text((width//2, height-45), 'x', fill=NAVY, font=font)
    draw.text((20, top+180), 'Grado de pertenencia', fill=NAVY, font=font)

    # Legend
    lx, ly = width-430, top+15
    for label, _, color, style in curves:
        draw.line((lx, ly+5, lx+55, ly+5), fill=color, width=5)
        draw.text((lx+68, ly), label, fill='#243746', font=font)
        ly += 26
    if note:
        draw.rounded_rectangle((left+15, height-bottom-58, left+610, height-bottom-15),
                               radius=8, fill='#F3F7FB', outline='#B9C8D4')
        draw.text((left+28, height-bottom-45), note, fill='#243746', font=font)
    canvas.save(path)


def make_plots():
    x = np.linspace(0, 5, 1001)
    a, b = mu_a(x), mu_b(x)
    save_plot(IMG/'01_conjuntos_originales.png', [
        ('A triangular (0,1,2)', a, BLUE, '-'),
        ('B trapezoidal (1,3,4,5)', b, ORANGE, '-'),
    ], 'Conjuntos difusos originales', 'Cruce: x=5/3, pertenencia=1/3')
    save_plot(IMG/'02_uniones.png', [
        ('Zadeh: max', np.maximum(a,b), BLUE, '-'),
        ('Probabilistica', a+b-a*b, ORANGE, '--'),
        ('Lukasiewicz', np.minimum(1,a+b), TEAL, ':'),
    ], 'Comparacion de las tres uniones')
    save_plot(IMG/'03_intersecciones.png', [
        ('Zadeh: min', np.minimum(a,b), BLUE, '-'),
        ('Algebraica: producto', a*b, ORANGE, '--'),
        ('Lukasiewicz', np.maximum(0,a+b-1), TEAL, ':'),
    ], 'Comparacion de las tres intersecciones', 'TL es cero porque A(x)+B(x) nunca supera 1')
    save_plot(IMG/'04_negaciones.png', [
        ('NZ(A)=1-A', 1-a, BLUE, '-'),
        ('NY(A), w=2', np.sqrt(1-a*a), ORANGE, '--'),
    ], 'Negaciones del conjunto A', 'w=2 es un supuesto para representar Yager')


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleCustom', parent=styles['Title'], fontName='Helvetica-Bold',
    fontSize=24, leading=29, textColor=colors.HexColor(NAVY), alignment=TA_CENTER, spaceAfter=12))
styles.add(ParagraphStyle(name='SubTitle', parent=styles['Normal'], fontName='Helvetica',
    fontSize=11, leading=15, textColor=colors.HexColor('#4D6373'), alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle(name='H1Custom', parent=styles['Heading1'], fontName='Helvetica-Bold',
    fontSize=16, leading=20, textColor=colors.HexColor(NAVY), spaceBefore=10, spaceAfter=8))
styles.add(ParagraphStyle(name='H2Custom', parent=styles['Heading2'], fontName='Helvetica-Bold',
    fontSize=12.5, leading=16, textColor=colors.HexColor(BLUE), spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle(name='BodyCustom', parent=styles['BodyText'], fontName='Helvetica',
    fontSize=9.5, leading=13.5, textColor=colors.HexColor('#243746'), spaceAfter=6))
styles.add(ParagraphStyle(name='Formula', parent=styles['BodyText'], fontName='Courier',
    fontSize=9, leading=13, textColor=colors.HexColor(NAVY), backColor=colors.HexColor(LIGHT),
    borderPadding=7, spaceBefore=4, spaceAfter=8))
styles.add(ParagraphStyle(name='Small', parent=styles['BodyText'], fontSize=8, leading=10.5,
    textColor=colors.HexColor('#506575'), spaceAfter=4))
styles.add(ParagraphStyle(name='Callout', parent=styles['BodyText'], fontSize=9.5, leading=13.5,
    textColor=colors.HexColor(NAVY), backColor=colors.HexColor('#EAF2FF'),
    borderColor=colors.HexColor(BLUE), borderWidth=1, borderPadding=8, spaceBefore=5, spaceAfter=8))


def P(text, style='BodyCustom'):
    return Paragraph(text, styles[style])


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#D7E1EA'))
    canvas.line(1.6*cm, 1.25*cm, 20*cm, 1.25*cm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#607586'))
    canvas.drawString(1.6*cm, .82*cm, 'Taller de logica difusa - solucion verificada')
    canvas.drawRightString(20*cm, .82*cm, f'Pagina {doc.page}')
    canvas.restoreState()


def section(title):
    return P(title, 'H1Custom')


def subsection(title):
    return P(title, 'H2Custom')


def img(path, width=17.5*cm):
    im = Image(str(path), width=width, height=width*0.47)
    im.hAlign = 'CENTER'
    return im


def make_pdf():
    doc = SimpleDocTemplate(str(PDF), pagesize=letter, rightMargin=1.6*cm,
        leftMargin=1.6*cm, topMargin=1.45*cm, bottomMargin=1.55*cm,
        title='Taller de logica difusa - solucion completa')
    story = []
    story += [Spacer(1, 1.1*cm), P('Taller de logica difusa', 'TitleCustom'),
              P('Solucion completa, analitica y discreta con MATLAB y Python', 'SubTitle')]
    story += [P('<b>Objetivo.</b> Construir los conjuntos A y B, calcular tres uniones, tres intersecciones y las negaciones solicitadas, justificando cada paso.', 'Callout')]
    story += [P('<b>Conclusion principal:</b> la fotografia y las convenciones oficiales de MATLAB respaldan interpretar A como triangular (0,1,2) y B como trapezoidal (1,3,4,5). La negacion de Yager requiere un parametro w que no aparece en el enunciado.', 'BodyCustom')]
    story += [Spacer(1, .3*cm), Image(str(IMG/'foto_enunciado.jpg'), width=12.2*cm, height=13.8*cm)]
    story[-1].hAlign = 'CENTER'
    story += [P('Fotografia original del enunciado.', 'Small'), PageBreak()]

    story += [section('1. Lectura del enunciado y alcance')]
    story += [P('<b>Visible:</b> A={x,0,1,2}; B={x,1,3,4,5}; se piden S, T y N usando Sprob, SZ, SL, TZ, TA, TL, NZ y NY; entrega analitica y discreta.', 'BodyCustom')]
    story += [P('<b>Inferencia sustentada:</b> A=trimf(x,[0,1,2]) y B=trapmf(x,[1,3,4,5]). La grafica dibujada tambien muestra un triangulo y un trapecio.', 'BodyCustom')]
    story += [P('<b>Dato faltante:</b> Yager necesita w&gt;0. Conservamos la formula general y usamos w=2 solo en tabla y grafica.', 'Callout')]
    story += [subsection('Fuentes de definicion')]
    story += [P('MathWorks, documentacion oficial: trimf usa [a b c] y trapmf usa [a b c d]. Springer, Introduction to Fuzzy Sets, ecuaciones 1.16 a 1.18: Zadeh, producto/suma algebraica y Lukasiewicz.', 'BodyCustom')]
    story += [P('https://uk.mathworks.com/help/fuzzy/trimf.html<br/>https://uk.mathworks.com/help/fuzzy/trapmf.html<br/>https://link.springer.com/chapter/10.1007/978-3-319-59614-3_1', 'Small')]

    story += [section('2. Construccion de las funciones de pertenencia')]
    story += [subsection('Conjunto triangular A=(0,1,2)')]
    story += [P('Los puntos son (0,0), (1,1) y (2,0). Entre 0 y 1 la pendiente es 1; entre 1 y 2 la pendiente es -1.', 'BodyCustom')]
    story += [P('muA(x) = 0, x&lt;=0;  x, 0&lt;x&lt;=1;  2-x, 1&lt;x&lt;2;  0, x&gt;=2.', 'Formula')]
    story += [subsection('Conjunto trapezoidal B=(1,3,4,5)')]
    story += [P('Los puntos son (1,0), (3,1), (4,1) y (5,0). La subida tiene pendiente 1/2, luego hay una meseta y finalmente una bajada con pendiente -1.', 'BodyCustom')]
    story += [P('muB(x) = 0, x&lt;=1;  (x-1)/2, 1&lt;x&lt;3;  1, 3&lt;=x&lt;=4;  5-x, 4&lt;x&lt;5;  0, x&gt;=5.', 'Formula')]
    story += [img(IMG/'01_conjuntos_originales.png')]
    story += [subsection('Punto de cruce')]
    story += [P('En 1&lt;x&lt;2: muA=2-x y muB=(x-1)/2. Igualando: 2-x=(x-1)/2, por lo que 4-2x=x-1, 5=3x y x=5/3. La pertenencia comun es 1/3.', 'BodyCustom')]
    story += [P('Cruce = (5/3, 1/3) aproximadamente (1.6667, 0.3333).', 'Callout'), PageBreak()]

    story += [section('3. Uniones: operador S')]
    story += [P('Una union representa A o B. Cada operador combina a=muA(x) y b=muB(x) de manera diferente.', 'BodyCustom')]
    story += [subsection('3.1 Zadeh')]
    story += [P('SZ(a,b)=max(a,b). Conserva la pertenencia mayor.', 'Formula')]
    story += [P('SZ(x)=0 si x&lt;=0; x en (0,1]; 2-x en (1,5/3]; (x-1)/2 en (5/3,3); 1 en [3,4]; 5-x en (4,5); 0 si x&gt;=5.', 'BodyCustom')]
    story += [subsection('3.2 Suma probabilistica')]
    story += [P('Sprob(a,b)=a+b-ab. El termino ab corrige la parte contabilizada por ambos conjuntos.', 'Formula')]
    story += [P('En 1&lt;x&lt;2: Sprob=(2-x)+(x-1)/2-(2-x)(x-1)/2=(x^2-4x+5)/2.', 'BodyCustom')]
    story += [P('Sprob(x)=0 si x&lt;=0; x en (0,1]; (x^2-4x+5)/2 en (1,2); (x-1)/2 en [2,3); 1 en [3,4]; 5-x en (4,5); 0 si x&gt;=5.', 'BodyCustom')]
    story += [subsection('3.3 Lukasiewicz')]
    story += [P('SL(a,b)=min(1,a+b). Impide que una pertenencia supere 1.', 'Formula')]
    story += [P('En 1&lt;x&lt;2: a+b=(3-x)/2. Entonces SL(x)=(3-x)/2 en ese intervalo.', 'BodyCustom')]
    story += [P('SL(x)=0 si x&lt;=0; x en (0,1]; (3-x)/2 en (1,2); (x-1)/2 en [2,3); 1 en [3,4]; 5-x en (4,5); 0 si x&gt;=5.', 'BodyCustom')]
    story += [img(IMG/'02_uniones.png'), PageBreak()]

    story += [section('4. Intersecciones: operador T')]
    story += [P('Una interseccion representa A y B. Solo puede ser positiva donde ambos conjuntos son positivos: 1&lt;x&lt;2.', 'BodyCustom')]
    story += [subsection('4.1 Zadeh')]
    story += [P('TZ(a,b)=min(a,b). Conserva la pertenencia menor.', 'Formula')]
    story += [P('TZ(x)=0 si x&lt;=1; (x-1)/2 en (1,5/3]; 2-x en (5/3,2); 0 si x&gt;=2.', 'BodyCustom')]
    story += [subsection('4.2 Producto algebraico')]
    story += [P('TA(a,b)=ab.', 'Formula')]
    story += [P('En 1&lt;x&lt;2: TA=(2-x)(x-1)/2=(-x^2+3x-2)/2. Fuera del intervalo vale 0.', 'BodyCustom')]
    story += [subsection('4.3 Lukasiewicz')]
    story += [P('TL(a,b)=max(0,a+b-1).', 'Formula')]
    story += [P('En el solapamiento, a+b-1=(1-x)/2, que nunca es positivo para x&gt;=1. Por eso TL(x)=0 en todo el universo. No es un error.', 'Callout')]
    story += [img(IMG/'03_intersecciones.png')]

    story += [section('5. Negaciones de A')]
    story += [subsection('5.1 Zadeh')]
    story += [P('NZ(a)=1-a.', 'Formula')]
    story += [P('NZ(A)(x)=1 si x&lt;=0; 1-x en (0,1]; x-1 en (1,2); 1 si x&gt;=2.', 'BodyCustom')]
    story += [subsection('5.2 Yager')]
    story += [P('NY,w(a)=(1-a^w)^(1/w), con w&gt;0.', 'Formula')]
    story += [P('NY,w(A)(x)=1 si x&lt;=0; (1-x^w)^(1/w) en (0,1]; (1-(2-x)^w)^(1/w) en (1,2); 1 si x&gt;=2.', 'BodyCustom')]
    story += [P('El valor w=2 empleado a continuacion es un supuesto de representacion, no un dato visible.', 'Callout')]
    story += [img(IMG/'04_negaciones.png'), PageBreak()]

    story += [section('6. Comprobacion manual en x=1.5')]
    checks = [
        ['Cantidad', 'Calculo', 'Resultado'],
        ['muA', '2-1.5', '0.500'], ['muB', '(1.5-1)/2', '0.250'],
        ['SZ', 'max(0.5,0.25)', '0.500'], ['Sprob', '0.5+0.25-(0.5)(0.25)', '0.625'],
        ['SL', 'min(1,0.5+0.25)', '0.750'], ['TZ', 'min(0.5,0.25)', '0.250'],
        ['TA', '(0.5)(0.25)', '0.125'], ['TL', 'max(0,0.5+0.25-1)', '0.000'],
        ['NZ(A)', '1-0.5', '0.500'], ['NY,2(A)', 'sqrt(1-0.5^2)', '0.866'],
    ]
    tbl = Table(checks, colWidths=[3.1*cm, 8.4*cm, 3.1*cm], repeatRows=1)
    tbl.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.HexColor(NAVY)), ('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'), ('FONTNAME',(0,1),(-1,-1),'Helvetica'),
        ('FONTSIZE',(0,0),(-1,-1),8.5), ('GRID',(0,0),(-1,-1),.4,colors.HexColor('#C7D3DD')),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor(LIGHT)]),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'), ('LEFTPADDING',(0,0),(-1,-1),6), ('RIGHTPADDING',(0,0),(-1,-1),6),
    ]))
    story += [tbl, Spacer(1,.35*cm), P('Los resultados propuestos para x=1.5 son correctos.', 'Callout')]

    story += [section('7. Tabla discreta, paso 0.5')]
    xd=np.arange(0,5.01,.5); a=mu_a(xd); b=mu_b(xd)
    rows=[['x','A','B','SZ','Sprob','SL','TZ','TA','TL','NZ','NY2']]
    for xv,av,bv in zip(xd,a,b):
        vals=[xv,av,bv,max(av,bv),av+bv-av*bv,min(1,av+bv),min(av,bv),av*bv,max(0,av+bv-1),1-av,math.sqrt(max(0,1-av*av))]
        rows.append([f'{v:.3f}' if i else f'{v:.1f}' for i,v in enumerate(vals)])
    dt=Table(rows, colWidths=[1.15*cm]+[1.38*cm]*10, repeatRows=1)
    dt.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.HexColor(NAVY)),('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),6.7),
        ('ALIGN',(0,0),(-1,-1),'CENTER'),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#C7D3DD')),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor(LIGHT)]),
        ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
    ]))
    story += [dt, P('NY2 significa negacion de Yager con w=2.', 'Small'), PageBreak()]

    story += [section('8. Quiz de conceptos A-E')]
    qimg=Image(str(IMG/'foto_quiz.jpg'), width=17.5*cm, height=9.84*cm); qimg.hAlign='CENTER'
    story += [qimg, Spacer(1,.2*cm)]
    concept=[['Letra','Interpretacion probable','Confianza'],
        ['A','Grado de pertenencia mu(x), eje vertical de 0 a 1','Alta'],
        ['B','Zona de solapamiento entre conjuntos','Media-alta'],
        ['C','Soporte del conjunto señalado: mu(x)>0','Media'],
        ['D','Funciones de pertenencia o conjuntos difusos','Media'],
        ['E','Universo de discurso o dominio de x','Media-alta']]
    ct=Table(concept,colWidths=[1.5*cm,12.7*cm,2.7*cm],repeatRows=1)
    ct.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.HexColor(NAVY)),('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),8),
        ('GRID',(0,0),(-1,-1),.4,colors.HexColor('#C7D3DD')),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor(LIGHT)]),
        ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),
    ]))
    story += [ct, P('Advertencia: las flechas C, D y E no son totalmente nitidas; estos nombres deben confirmarse con el docente.', 'Callout')]

    story += [section('9. Entrega y datos por confirmar')]
    story += [P('<b>Entregar:</b> funciones de A y B, punto de cruce, seis operaciones por tramos, negaciones de A, tabla discreta, graficas y codigo.', 'BodyCustom')]
    story += [P('<b>Confirmar con el docente:</b> (1) si la primera S se llama Sprob; (2) el parametro w de Yager; (3) los nombres exactos esperados para C, D y E.', 'Callout')]
    story += [P('<b>Archivos incluidos en la carpeta:</b> PDF, fotografias, cuatro graficas, codigo MATLAB y codigo Python.', 'BodyCustom')]

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == '__main__':
    make_plots()
    make_pdf()
    print(PDF)
