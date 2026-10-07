clear;
close all;
clc;

x = 0:0.01:5;

% Funciones originales
muA = max(min(x, 2-x), 0);                     % A = (0,1,2)
muB = max(min(min((x-1)/2, 1), 5-x), 0);      % B = (1,3,4,5)

% Uniones
SZ = max(muA, muB);
Sprob = muA + muB - muA.*muB;
SL = min(1, muA + muB);

% Intersecciones
TZ = min(muA, muB);
TA = muA.*muB;
TL = max(0, muA + muB - 1);

% Negaciones de A
NZ_A = 1 - muA;
w = 2; % Supuesto para graficar; el enunciado no especifica w.
NY_A = (1 - muA.^w).^(1/w);

% Comprobacion en x = 1.5
x0 = 1.5;
a0 = max(min(x0, 2-x0), 0);
b0 = max(min(min((x0-1)/2, 1), 5-x0), 0);

fprintf('x=%.1f: A=%.3f, B=%.3f\n', x0, a0, b0);
fprintf('SZ=%.3f, Sprob=%.3f, SL=%.3f\n', ...
    max(a0,b0), a0+b0-a0*b0, min(1,a0+b0));
fprintf('TZ=%.3f, TA=%.3f, TL=%.3f\n', ...
    min(a0,b0), a0*b0, max(0,a0+b0-1));

figure;
subplot(2,2,1);
plot(x,muA,'LineWidth',2); hold on;
plot(x,muB,'LineWidth',2);
title('Conjuntos originales'); legend('A','B'); grid on;

subplot(2,2,2);
plot(x,SZ,'LineWidth',2); hold on;
plot(x,Sprob,'LineWidth',2);
plot(x,SL,'LineWidth',2);
title('Uniones'); legend('S_Z','S_{prob}','S_L'); grid on;

subplot(2,2,3);
plot(x,TZ,'LineWidth',2); hold on;
plot(x,TA,'LineWidth',2);
plot(x,TL,'LineWidth',2);
title('Intersecciones'); legend('T_Z','T_A','T_L'); grid on;

subplot(2,2,4);
plot(x,NZ_A,'LineWidth',2); hold on;
plot(x,NY_A,'LineWidth',2);
title('Negaciones de A'); legend('N_Z(A)','N_Y(A), w=2'); grid on;

for k = 1:4
    subplot(2,2,k);
    xlim([0 5]); ylim([0 1.05]);
    xlabel('x'); ylabel('Grado de pertenencia');
end
